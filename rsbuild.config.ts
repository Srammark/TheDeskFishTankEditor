import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import os from 'os';
import fs from 'fs';
import path from 'path';

// 获取本机 IP 地址
function GetLocalIP(): string
{
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces))
    {
        const ifaceList = interfaces[name];
        if (!ifaceList) continue;
        for (const iface of ifaceList)
        {
            // 跳过内部地址和非 IPv4
            if (iface.family === 'IPv4' && !iface.internal)
            {
                return iface.address;
            }
        }
    }
    return 'localhost'; //  fallback
}

const LOCAL_IP = GetLocalIP();
const PORT = 14262;

// 是否启用 HTTPS
const USE_HTTPS = false;

export default defineConfig({
    server: {
        port: PORT,
        host: '0.0.0.0',  // 监听所有网卡，支持局域网访问
        open: `${USE_HTTPS ? 'https' : 'http'}://${LOCAL_IP}:${PORT}`,
        cors: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Cross-Origin-Resource-Policy": "cross-origin",
        }
    },
    dev: {
        // 客户端 WebSocket 配置
        client: {
            host: LOCAL_IP,
            port: PORT,
            protocol: USE_HTTPS ? 'wss' : 'ws',
            overlay: false,
        },
        // 懒加载 chunk 使用对应协议
        assetPrefix: `${USE_HTTPS ? 'https' : 'http'}://${LOCAL_IP}:${PORT}`,
    },
    plugins: [pluginVue()],
    html: {
        template: './public/index.html',
        templateParameters: {
        }
    },
    source: {
        entry: {
            index: './example/index.ts',
        }
    },
    resolve: {
        alias: {
            '@': './src',
        },
    },
    output: {
        distPath: {
            root: './distExample',
            js: '',        // JS 输出到根目录，而不是 static/js/
            css: '',       // CSS 输出到根目录
            html: '',      // HTML 输出到根目录
        },
        filename: {
            js: '[name].js',      // 不使用 contenthash，保持简单路径
            css: '[name].css',
        },
        polyfill: 'entry',
        assetPrefix: './',
        manifest: true,
    },
    performance: {
        chunkSplit: {
            strategy: 'split-by-experience',
        },
    },
    tools: {
        rspack: {
            devtool: 'eval-source-map',
            experiments: {
                lazyCompilation: {
                    entries: false,
                    imports: true,
                    serverUrl: `${USE_HTTPS ? 'https' : 'http'}://${LOCAL_IP}:${PORT}`,
                }
            },
            resolveLoader: {
                alias: {
                    'worker-loader': require.resolve('worker-rspack-loader'),
                },
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        use: {
                            loader: 'builtin:swc-loader',
                            options: {
                                jsc: {
                                    target: 'es2015',
                                },
                                // ...other options
                            },
                        },
                    },
                ],
            },
            optimization: {
                splitChunks: {
                    chunks: 'async',
                    cacheGroups: {
                       
                    },
                },
            },
        },
    },
});
