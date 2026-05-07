export interface BuildConfig {
    name:                      string;
    server:                    string;
    engineModulesConfigKey:    string;
    platform:                  string;
    buildPath:                 string;
    debug:                     boolean;
    buildMode:                 string;
    mangleProperties:          boolean;
    md5Cache:                  boolean;
    skipCompressTexture:       boolean;
    sourceMaps:                string;
    overwriteProjectSettings:  OverwriteProjectSettings;
    nativeCodeBundleMode:      string;
    polyfills:                 Polyfills;
    experimentalEraseModules:  boolean;
    startSceneAssetBundle:     boolean;
    bundleConfigs:             BundleConfig[];
    inlineEnum:                boolean;
    useBuiltinServer:          boolean;
    md5CacheOptions:           Md5CacheOptions;
    mainBundleIsRemote:        boolean;
    mainBundleCompressionType: string;
    useSplashScreen:           boolean;
    bundleCommonChunk:         boolean;
    packAutoAtlas:             boolean;
    startScene:                string;
    outputName:                string;
    taskName:                  string;
    scenes:                    Scene[];
    wasmCompressionMode:       boolean;
    binGroupConfig:            BinGroupConfig;
    packages:                  Packages;
    __version__:               string;
    logDest:                   string;
}

export interface BinGroupConfig {
    threshold: number;
    enable:    boolean;
}

export interface BundleConfig {
    name:   string;
    root:   string;
    output: boolean;
    uuid?:  string;
}

export interface Md5CacheOptions {
    excludes:              any[];
    includes:              any[];
    replaceOnly:           any[];
    handleTemplateMd5Link: boolean;
}

export interface OverwriteProjectSettings {
    includeModules: IncludeModules;
    macroConfig:    MacroConfig;
}

export interface IncludeModules {
    "gfx-webgl2": string;
    physics:      string;
    "physics-2d": string;
}

export interface MacroConfig {
    cleanupImageCache: string;
}

export interface Packages {
    "web-mobile":         WebMobile;
    "adsense-h5g-plugin": AdsenseH5GPlugin;
    "cocos-service":      CocosService;
}

export interface AdsenseH5GPlugin {
    enableAdsense:            boolean;
    enableTestAd:             boolean;
    __version__:              string;
    AFPHostPropertyCode:      string;
    AFPHostDomain:            string;
    otherAFPHostPropertyCode: string;
    otherAFPDomain:           string;
}

export interface CocosService {
    configID:    string;
    services:    any[];
    __version__: string;
}

export interface WebMobile {
    useWebGPU:        boolean;
    orientation:      string;
    embedWebDebugger: boolean;
    __version__:      string;
}

export interface Polyfills {
    asyncFunctions: boolean;
}

export interface Scene {
    url:  string;
    uuid: string;
}
