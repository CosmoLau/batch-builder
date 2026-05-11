<script setup lang="ts">
import { exec } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { inject, onMounted, reactive, ref, watch } from 'vue';
import { CheckboxValueType, ElMessage, FormInstance, FormRules } from 'element-plus';
import { keyAppRoot, keyMessage } from '../provide-inject';
import { Box, Files } from '@element-plus/icons-vue';
import path from 'node:path';
import { BuildConfig, BundleConfig } from '../../@types/build-config';
import { FolderOpened, Document } from '@element-plus/icons-vue';
import open from 'open';
import { getPackageJson, getProjectPath } from '../utils';
import extensionPackage from '../../../package.json';

onMounted(() => {

})

const appRootDom = inject(keyAppRoot);
const message = inject(keyMessage)!;
/** 主项目 package.json 文件 */
const packageJson = getPackageJson();
/** 默认构建产出位置 */
const buildDir = getProjectPath("build/" + packageJson.name);
/** 临时构建配置文件路径 */
const tempConfigPath = getProjectPath("temp/tempConfig.json");
/** 获取场景目录 */
function getSceneDir() {
    const scenePath = getProjectPath("/assets/scene");
    const files = readdirSync(scenePath);
    const dirList = files.filter((item) => item.endsWith('.scene'));
    return dirList.map((item) => {
        return {
            name: item.replace('.scene', ''),
            path: scenePath + '/' + item,
            checked: false,
        }
    });
}
/** 获取构建配置文件路径 */
function getBuildConfigPath() {
    let configPath = localStorage.getItem('buildConfigPath');
    if (existsSync(configPath)) {
        return configPath;
    }
    configPath = getProjectPath("build-templates/batch-builder/buildConfig_template.json");
    if (existsSync(configPath)) {
        return configPath;
    }
    return null;
}
let buildConfig: BuildConfig = null;

/** 构建 */
async function build() {
    /** 是否满足单独构建条件 */
    const canIndieBuild = selected.value.length != 0 && buildType.value == BuildType.INDIE;
    /** 是否满足合并构建条件 */
    const canMergeBuild = startScene.value.length != 0 && buildType.value == BuildType.MERGE;
    if (!canIndieBuild && !canMergeBuild) {
        ElMessage({
            message: '请选择要构建的项目',
            type: 'warning',
            appendTo: appRootDom,
        });
        return;
    }
    if (!ruleForm.buildConfigPath) {
        ElMessage({
            message: '请选择构建配置文件',
            type: 'warning',
            appendTo: appRootDom,
        });
        return;
    }
    else {
        buildConfig = JSON.parse(readFileSync(ruleForm.buildConfigPath, 'utf-8'));
    }
    ElMessage({
        message: '构建开始',
        type: 'success',
        appendTo: appRootDom,
    });
    // 清空构建失败日志列表
    errLogList.value = [];
    progressStatus.value = null;
    buildButonState.value = true;
    // console.log("选中项目列表: ", selected.value);
    percentage.value = 0;
    let total = 0;
    if (buildType.value == BuildType.INDIE) {
        total = selected.value.length;
    }
    else if (buildType.value == BuildType.MERGE) {
        total = 1;
    }
    let count = 0;
    let errCount = 0;
    /** 重试次数 */
    let retryTimes = 0;
    let task = async (item: string) => {
        // 重试次数超过 4 次，结束构建
        if (retryTimes > 4) {
            console.error(`构建项目 ${item} 失败，重试次数超过 4 次，已结束构建`);
            errCount++;
            // 改变构建进度状态为异常
            progressStatus.value = 'exception';
            return;
        }
        // 正式开始构建
        const itemUuid = await Editor.Message.request('asset-db', 'query-uuid', `db://assets/scene/${item}.scene`);
        const bundleUuid = await Editor.Message.request('asset-db', 'query-uuid', `db://assets/bundle/${item}`);
        buildConfig.name = item;
        buildConfig.startScene = itemUuid;
        buildConfig.buildPath = `project://build`;
        buildConfig.outputName = packageJson.name + "/" + item;
        buildConfig.taskName = buildConfig.platform + '-' + item;
        if (buildType.value == BuildType.INDIE) {
            buildConfig.scenes = [{
                url: "db://assets/scene/" + item + ".scene",
                uuid: itemUuid,
            }];
        }
        else if (buildType.value == BuildType.MERGE) {
            buildConfig.scenes = sceneList.value.map((item) => {
                return {
                    url: "db://assets/scene/" + item.name + ".scene",
                    uuid: itemUuid,
                }
            })
        }
        let bundleConfig: BundleConfig[] = [];
        bundleConfig = buildConfig.bundleConfigs.filter((item) => item.name == "internal" || item.name == "main" || item.name == "resources");
        let bundleArr = sceneList.value.map((scene) => {
            return {
                name: scene.name,
                root: `db://assets/bundle/${scene.name}`,
                output: true,
                uuid: bundleUuid,
            }
        })
        if (buildType.value == BuildType.MERGE) {
            bundleConfig.push(...bundleArr);
        } else if (buildType.value == BuildType.INDIE) {
            bundleConfig.push({
                name: item,
                root: `db://assets/bundle/${item}`,
                output: true,
                uuid: bundleUuid,
            })
        }
        buildConfig.bundleConfigs = bundleConfig;
        let logName = item + `-${new Date().toLocaleString().replace(/[:\/\\]/g, '-')}.log`;
        buildConfig.logDest = getProjectPath("temp/batch-builder/" + logName);
        let outputPath = getProjectPath("build/" + buildConfig.outputName);
        // console.info(`构建输出路径: ${outputPath}`);
        // 检查输出路径是否存在，存在则删除
        if (existsSync(outputPath)) {
            // console.info(`构建输出路径已存在，删除: ${outputPath}`);
            rmSync(outputPath, { recursive: true });
        }
        writeFileSync(tempConfigPath, JSON.stringify(buildConfig, null, 2), 'utf-8');
        let command = `${cocosFilePath.value} --project ${getProjectPath()} --build "configPath=${tempConfigPath}"`;
        console.log("命令行：", command);
        exec(command, () => {
            let logContent = readFileSync(buildConfig.logDest, 'utf-8');
            if (logContent.includes("is missing or invalid")) {
                console.error(`构建时显示脚本丢失，请检查项目 ${item} 的产出！`);
                errCount++;
                retryTimes++;
                ElMessage({
                    message: `${item} 构建失败，第 ${retryTimes} 次重试`,
                    type: 'warning',
                    appendTo: appRootDom,
                });
                // 记录构建失败日志
                errLogList.value.push(logName);
                // 记录重试项目
                retryItemName.value = item;
                // 改变构建进度状态为重试
                progressStatus.value = 'warning';
                // 递归调用任务函数，重试构建
                buildType.value == BuildType.INDIE ? task(selected.value[count]) : null;
                return;
            }
            // 构建成功，重置重试次数
            retryTimes = 0;
            progressStatus.value = null;
            count++;
            percentage.value = Math.floor(count / total * 100);
            if (count < total) {
                // 连续构建可能导致脚本丢失，导致构建出错，所以间隔 5 秒再构建下一个项目
                setTimeout(() => {
                    buildType.value == BuildType.INDIE ? task(selected.value[count]) : null;
                }, 5000);
            } else {
                // 所有项目构建完成，改变构建进度状态为成功
                progressStatus.value = 'success';
                console.info(`构建完成，共 ${total} 个项目，成功 ${count - errCount} 个，失败 ${errCount} 个`);
                buildButonState.value = false;
                ElMessage({
                    message: '所有项目构建完成',
                    type: 'success',
                    appendTo: appRootDom,
                });
            }
        });
    };
    // 分情况构建
    if (buildType.value == BuildType.INDIE) {
        task(selected.value[0]);
    }
    else if (buildType.value == BuildType.MERGE) {
        task(startScene.value);
    }
}
function selectCocosPath() {
    Editor.Dialog.select({
        title: '选择 Cocos 执行文件',
        filters: [{
            name: 'Executable',
            extensions: ['exe']
        }],
        path: path.dirname(path.dirname(Editor.App.path)),
    }).then((result) => {
        if (result.filePaths && result.filePaths[0]) {
            ruleForm.cocosFilePath = result.filePaths[0];
            ruleFromRef.value?.validate();
        }
    });
}
function selectBuildConfigPath() {
    Editor.Dialog.select({
        title: '选择构建配置文件',
        filters: [{
            name: 'JSON',
            extensions: ['json']
        }],
        path: getProjectPath(),
    }).then((result) => {
        if (result.filePaths && result.filePaths[0]) {
            ruleForm.buildConfigPath = result.filePaths[0];
            ruleFromRef.value?.validate();
        }
    });
}
function openBuildPanel() {
    // @ts-ignore
    Editor.Message.request('builder', 'open');
}
/** 日志目录路径 */
const logFolderPath = getProjectPath("temp/batch-builder");
/**
 * 打开日志目录或文件
 * @param logPath 日志文件路径或目录路径
 */
function openLogFolderOrfile(logPath?: string) {
    let openPath = logFolderPath;
    if (logPath) {
        openPath = path.join(logFolderPath, logPath);
    }
    openFolderOrfile(openPath);
}
/**
 * 打开目录或文件
 * @param path 目录或文件路径
 */
function openFolderOrfile(path: string) {
    if (existsSync(path)) {
        // 使用 open 库来解决跨平台问题
        open(path);
    } else {
        ElMessage({
            message: '目录或文件不存在',
            type: 'error',
            appendTo: appRootDom,
        });
    }
}

/** 构建类型 */
enum BuildType {
    /** 单独构建 */
    INDIE,
    /** 合并构建 */
    MERGE,
}

const sceneList = ref(getSceneDir());
/** 单独构建选择的场景 */
const selected = ref<string[]>([]);
/** 合并构建的初始场景 */
const startScene = ref('');
const buildType = ref(BuildType.INDIE);
/** Cocos 主程序所在路径 */
const cocosFilePath = ref(path.join(path.dirname(path.dirname(Editor.App.path)), 'CocosCreator.exe'));
const checkAll = ref(false);
const indeterminate = ref(false);
const appRoot = ref(appRootDom);
/** 构建进度 */
const percentage = ref(0);
/** 构建进度状态 */
const progressStatus = ref<'success' | 'exception' | 'warning' | null>(null);
/** 是否显示进度条文本 */
const isInside = ref(false);
/** 重试项目 */
const retryItemName = ref('');
/** 进度条文本 */
const progressContent = ref('');
/** 构建按钮状态 */
const buildButonState = ref(false);
const bulkRef = ref<HTMLDivElement>(null);
/** 构建失败日志列表 */
const errLogList = ref([]);

watch(selected, (val) => {
    if (val.length === 0) {
        checkAll.value = false
        indeterminate.value = false
    } else if (val.length === sceneList.value.length) {
        checkAll.value = true
        indeterminate.value = false
    } else {
        indeterminate.value = true
    }
})
watch(progressStatus, (val) => {
    if (val) {
        isInside.value = true;
        switch (val) {
            case 'success':
                progressContent.value = '构建成功';
                break;
            case 'warning':
                progressContent.value = `项目 ${retryItemName.value} 构建重试`;
                break;
            case 'exception':
                progressContent.value = `项目 ${retryItemName.value} 构建失败`;
                break;
        }
    }
    else {
        isInside.value = false;
    }
})
const handleCheckAll = (val: CheckboxValueType) => {
    indeterminate.value = false
    if (val) {
        selected.value = sceneList.value.map((item) => item.name)
    } else {
        selected.value = [];
    }
}

const ruleFromRef = ref<FormInstance>();
const checkPath = (rule: any, value: any, callback: any) => {
    if (!value) {
        callback(new Error('请输入路径'));
    } else if (!existsSync(value)) {
        callback(new Error('路径不存在'));
    } else if (Editor.Utils.Path.basename(value) != "CocosCreator.exe") {
        callback(new Error('cocos 路径不正确'));
    } else {
        callback();
    }
}
const checkBuildConfigPath = (rule: any, value: any, callback: any) => {
    if (!value) {
        callback(new Error('请选择构建配置文件'));
    } else if (!existsSync(value)) {
        callback(new Error('构建配置文件不存在'));
    } else {
        callback();
    }
}
const ruleForm = reactive({
    /** Cocos 主程序所在路径 */
    cocosFilePath: path.join(path.dirname(path.dirname(Editor.App.path)), 'CocosCreator.exe'),
    /** 构建配置文件路径 */
    buildConfigPath: getBuildConfigPath(),
})
const rules = reactive<FormRules<typeof ruleForm>>({
    cocosFilePath: [
        { required: true, message: '请输入cocos路径', trigger: 'blur' },
        { validator: checkPath, trigger: 'blur' },
    ],
    buildConfigPath: [
        { required: true, message: '请选择构建配置文件', trigger: 'blur' },
        { validator: checkBuildConfigPath, trigger: 'blur' },
    ],
})

watch(() => ruleForm.buildConfigPath, (val) => {
    if (val) {
        localStorage.setItem('buildConfigPath', val);
    }
})
</script>

<template>
    <div ref="bulkRef" style="height: 100%;overflow: auto;">
        <el-container style="height: 100%;">
            <el-header>
                <h1>批量构建工具
                    <el-badge is-dot :offset="[-3, 15]" hidden>
                        <el-tag effect="plain" round>
                            v{{ extensionPackage.version }}
                        </el-tag>
                    </el-badge>
                </h1>
            </el-header>
            <el-main>
                <el-form :disabled="buildButonState" label-position="left" label-width="180px" :model="ruleForm"
                    :rules="rules" ref="ruleFromRef">
                    <el-form-item label="Cocos 路径" prop="cocosFilePath">
                        <el-input v-model="ruleForm.cocosFilePath" type="text" placeholder="请输入cocos路径">
                            <template #append>
                                <el-button :icon="Files" @click="selectCocosPath"></el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="构建配置模板" prop="buildConfigPath">
                        <el-tooltip content="构建配置模板文件需要从构建窗口中导出 json 格式的参数文件" :append-to="appRootDom" effect="light"
                            placement="top">
                            <el-input v-model="ruleForm.buildConfigPath" type="text" placeholder="请输入配置模板路径">
                                <template #prepend>
                                    <el-tooltip content="打开构建面板，导出构建配置" :append-to="appRootDom" effect="light"
                                        placement="bottom">
                                        <el-button :icon="Box" @click="openBuildPanel"></el-button>
                                    </el-tooltip>
                                </template>
                                <template #append>
                                    <el-button :icon="Files" @click="selectBuildConfigPath"></el-button>
                                </template>
                            </el-input>
                        </el-tooltip>
                    </el-form-item>
                    <el-form-item label="构建方式" disabled>
                        <el-radio-group v-model="buildType">
                            <el-radio-button label="单独构建" :value="BuildType.INDIE" />
                            <el-radio-button label="合并构建" :value="BuildType.MERGE" />
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="项目列表" v-if="buildType == BuildType.INDIE">
                        <el-select v-model="selected" multiple clearable :append-to="appRootDom" placeholder="请选择项目">
                            <template #header>
                                <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll">
                                    全选
                                </el-checkbox>
                            </template>
                            <el-option v-for="item in sceneList" :key="item.name" :label="item.name" :value="item.name">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="初始场景" v-if="buildType == BuildType.MERGE">
                        <el-select v-model="startScene" :append-to="appRootDom" placeholder="请选择初始场景">
                            <el-option v-for="item in sceneList" :key="item.name" :label="item.name" :value="item.name">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="build" :loading="buildButonState">
                            {{ buildButonState ? '构建中' :
                                '构建' }}
                        </el-button>
                    </el-form-item>
                </el-form>
                <el-progress :percentage="percentage" :status="progressStatus" :text-inside="isInside"
                    :stroke-width="isInside ? 20 : 6">
                    <span v-if="isInside">{{ progressContent }}</span>
                </el-progress>
                <el-button @click="openFolderOrfile(buildDir)" style="margin-top: 10px;">打开构建目录
                    <el-icon class="el-icon--right">
                        <FolderOpened />
                    </el-icon>
                </el-button>
                <el-button @click="openLogFolderOrfile(null)" style="margin-top: 10px;">打开日志目录
                    <el-icon class="el-icon--right">
                        <FolderOpened />
                    </el-icon>
                </el-button>
                <div v-for="log in errLogList" :key="log" style="margin-top: 10px;">
                    <el-button type="danger" @click="openLogFolderOrfile(log)">
                        {{ log }}
                        <el-icon class="el-icon--right">
                            <Document />
                        </el-icon>
                    </el-button>
                </div>
            </el-main>
            <el-footer>Made by <el-link href="https://github.com/CosmoLau"
                    target="_blank">@CosmoLau</el-link></el-footer>
        </el-container>
    </div>
</template>