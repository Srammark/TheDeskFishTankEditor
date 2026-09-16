export default
{
    language: {
        name: '简体中文'
    },
    core: {
        setting: {
            item: {
                language: {
                    name: '语言',
                    content: '程序显示语言'
                }
            }
        },
        service: {
            language: {
                error: {
                    loadLanguagePackageError: '加载语言包异常'
                }
            }
        }
    },
    page: {
        managePackage: {
            packageList: {
                import: '导入包',
                title: '资源包管理',
                create: '新建包',
                export: '导出',
                delete: '删除',
                unnamed: '(未命名)',
                unknownAuthor: '未知作者',
                emptyTip: '暂无资源包，点击右上角"新建包"或"导入包"开始',
                promptCreateName: '请输入新包名称：',
                confirmDelete: '确定要删除资源包 "{name}" 吗？此操作不可撤销。'
            }
        },
        manageResourcePackage: {
            editor: {
                defaultTitle: '资源扩展包编辑器',
                import: '导入',
                export: '导出',
                save: '保存',
                placeholder: '请在左侧选择一个节点进行编辑',
                promptSpeciesName: '请输入物种文件夹名称（拉丁学名，如 PoeciliaReticulata）：',
                promptSpeciesCategory: '请选择物种类型：\n1. 鱼 (Fish)\n2. 虾 (Shrimp)\n3. 蟹 (Crab)\n4. 螺 (Snail)\n5. 贝类 (Bivalve)\n\n请输入序号：',
                alertInvalidCategory: '无效的类型序号。',
                confirmRemoveSpecies: '确定要删除物种 "{name}" 吗？此操作不可撤销。',
                promptStrainName: '请输入新品系名称（如 Albino）：',
                confirmRemoveStrain: '确定要删除品系 "{name}" 吗？',
                promptDecorationName: '请输入装饰物文件夹名称：',
                confirmRemoveDecoration: '确定要删除装饰物 "{name}" 吗？',
                confirmRemoveDecorationPart: '确定要删除子部件 "{name}" 吗？',
                promptSubstrateName: '请输入基底文件夹名称：',
                confirmRemoveSubstrate: '确定要删除基底 "{name}" 吗？',
                promptGlassName: '请输入玻璃样式文件夹名称：',
                confirmRemoveGlass: '确定要删除玻璃样式 "{name}" 吗？',
                alertLanguageExists: '该语言标签已存在。',
                confirmRemoveLanguage: '确定要删除语言文件 "{name}.json" 吗？'
            },
            tree: {
                title: '扩展包结构',
                packageInfo: '包信息',
                language: '国际化',
                addLanguage: '添加语言',
                selectLanguage: '选择语言',
                addSpecies: '添加物种',
                addDecoration: '添加装饰物',
                addSubstrate: '添加基底',
                addGlass: '添加玻璃样式',
                addResource: '添加资源',
                defaultPartName: '部件 {index}'
            },
            handler: {
                creature: '生物',
                decoration: '装饰物',
                substrate: '基底',
                glass: '玻璃样式',
                speciesDesc: '物种描述',
                sexMale: '雄性',
                sexFemale: '雌性',
                sexFry: '鱼苗',
                creatureItem: '生物属性',
                spriteResource: '精灵图资源',
                unnamedPart: '未命名部件'
            },
            packageInfo: {
                title: '包信息 (info.json)',
                name: '名称',
                namePlaceholder: '包名',
                keywords: '关键词',
                keywordsPlaceholder: '关键词，逗号分隔',
                version: '版本',
                author: '作者',
                authorPlaceholder: '作者名称',
                license: '协议'
            },
            language: {
                title: '国际化 (Language/{langTag}.json)',
                importJson: '导入 JSON',
                hintPrefix: '键支持点号路径，如',
                hintSuffix: '会生成',
                importPlaceholder: '粘贴 JSON，如 {\'{\'} "fish": {\'{\'} "name": "孔雀鱼" {\'}\'} {\'}\'}',
                cancel: '取消',
                merge: '合并生成条目',
                keyPlaceholder: '键 (如 a.b.c)',
                valuePlaceholder: '值',
                addEntry: '添加条目',
                preview: '实时预览',
                alertParseFailed: 'JSON 解析失败，请检查格式。',
                alertNotObject: 'JSON 必须是一个对象。'
            },
            speciesDesc: {
                title: '物种描述 (speciesDescription.json)',
                category: '物种类型',
                categoryPlaceholder: '未设置',
                scientificName: '拉丁学名',
                name: '名称',
                wiki: 'Wiki',
                keyPlaceholder: '国际化字符串键名'
            },
            strain: {
                title: '品系信息',
                scientificName: '拉丁学名',
                scientificNamePlaceholder: '继承自物种描述',
                name: '名称',
                wiki: 'Wiki',
                keyPlaceholder: '国际化字符串键名',
                avatar: '品系头像',
                noAvatar: '无头像',
                clickUpload: '点击上传',
                uploadAvatar: '上传头像',
                removeAvatar: '删除头像',
                avatarTip: '推荐尺寸 100 × 100 像素，上传后会自动缩放'
            },
            item: {
                title: '{category}属性 (item.json)',
                fallbackCategory: '生物',
                base: {
                    speedLimit: '最高速度',
                    visualRadius: '感知半径',
                    stature: '体型大小',
                    sizeLarge: '大',
                    sizeMedium: '中',
                    sizeSmall: '小',
                    swimmingLevel: '活动水层',
                    levelShallow: '浅',
                    levelDeep: '深',
                    gregariousness: '群居性',
                    idealGroupSize: '理想群数',
                    aggression: '攻击性',
                    territoriality: '领地意识',
                    diet: '食性',
                    metabolism: '代谢量',
                    stressSensitivity: '压力敏感',
                    alertness: '警惕性',
                    reproduction: '繁殖方式',
                    temperature: '适宜温度',
                    lifespan: '寿命',
                    matureAge: '成熟期',
                    litterSize: '每窝数量',
                    hatchTime: '孵化时间',
                    gestationTime: '怀孕时长',
                    dayNightHabit: '昼夜习性'
                },
                unit: {
                    mmPerSecond: 'mm/s',
                    mm: 'mm',
                    mgPerDay: 'mg/日',
                    year: '年',
                    month: '月',
                    day: '天',
                    mlPerSecond: '毫升/秒'
                },
                fish: {
                    section: '鱼类专属',
                    swimMode: '游动模式'
                },
                shrimp: {
                    section: '虾类专属',
                    moltCycle: '蜕壳周期',
                    moltVulnerability: '蜕壳脆弱期'
                },
                crab: {
                    section: '蟹类专属',
                    moltCycle: '蜕壳周期',
                    moltVulnerability: '蜕壳脆弱期'
                },
                bivalve: {
                    section: '贝类专属',
                    filterRate: '滤水速率'
                }
            },
            sprite: {
                title: '精灵图资源',
                toCollisionMode: '转为编辑碰撞体',
                toImageMode: '转为编辑图片',
                frameSize: '帧尺寸',
                tipImage: '提示：点击格子上传帧图片',
                tipCollision: '提示：点击格子选择要编辑碰撞体的帧',
                actionIdle: '悬浮',
                actionSwim: '游动',
                actionEat: '吃食',
                copyToPrev: '复制到上一帧',
                copyToNext: '复制到下一帧',
                copyToAll: '应用到全部帧'
            },
            collision: {
                body: '身体',
                mouth: '嘴部',
                overridden: '已覆盖 ×',
                overrideTip: '该帧形状已被覆盖，点击重置为基础形状',
                createShape: '创建形状',
                deleteShape: '删除形状',
                copyShape: '复制形状',
                pasteShape: '粘贴形状',
                copied: '已复制：{name}',
                baseShapeTip: '第 1 帧编辑的是基础形状（所有帧共用）'
            },
            shapeEditor: {
                shape: '形状',
                circle: '圆形',
                rectangle: '矩形',
                capsule: '胶囊',
                ellipse: '椭圆',
                polygon: '多边形',
                pie: '扇形',
                segment: '线段',
                radius: '半径',
                width: '宽度',
                height: '高度',
                length: '长度',
                sweep: '扫掠角',
                vertex: '顶点',
                vertexHint: '左键拖拽 / 右键删除 / 点击边添加',
                addVertex: '添加顶点',
                noShape: '当前无形状',
                delete: '删除',
                create: '创建'
            },
            animationPreview: {
                title: '动画预览',
                play: '播放',
                pause: '暂停',
                showColliders: '显示碰撞体'
            },
            decoration: {
                previewTitle: '装饰物预览：{name}',
                nameKey: '名称 Key',
                nameKeyPlaceholder: '例如 decoration.apple.name',
                descriptionKey: '简介 Key',
                descriptionKeyPlaceholder: '例如 decoration.apple.description',
                category: '分类',
                categoryPlaceholder: '请选择分类',
                thumbnail: '装饰物缩略图',
                noThumbnail: '无缩略图',
                clickUpload: '点击上传',
                uploadThumbnail: '上传缩略图',
                removeThumbnail: '删除缩略图',
                thumbnailTip: '推荐尺寸 100 × 100 像素，上传后会自动等比例缩放',
                noParts: '该装饰物暂无子部件',
                itemTitle: '装饰物属性：{name}',
                selectPartTip: '请在左侧树形菜单中选择一个子部件',
                tabBasic: '基础',
                tabSprite: '精灵图',
                tabAnimation: '动画',
                tabCollider: '碰撞体',
                tabArea: '区域',
                partName: '名称',
                partZIndex: 'Z 层级',
                uploadSprite: '上传精灵图',
                removeSprite: '删除',
                noSprite: '尚未上传精灵图',
                spritePanelTitle: '装饰物精灵图资源：{name}',
                spritePanelNoSprite: '无精灵图',
                animationMode: '动画模式',
                animationModeNone: '无',
                animationModeTween: '程序化动画',
                animationModeFrame: '帧动画',
                animationType: '动画类型',
                amplitude: '幅度(px)',
                frequency: '频率(Hz)',
                phase: '相位',
                axis: '方向',
                axisX: '水平',
                axisY: '垂直',
                minScale: '最小缩放',
                maxScale: '最大缩放',
                minAngle: '最小角度',
                maxAngle: '最大角度',
                pivotX: '锚点 X',
                pivotY: '锚点 Y',
                frameSize: '帧尺寸',
                uploadSheet: '上传雪碧图',
                uploadFrames: '批量上传帧',
                addFrame: '添加空帧',
                colliderFrameNav: '碰撞体 第 {current} / {total} 帧',
                defaultConfigTag: '（默认配置）',
                addCollider: '添加碰撞体',
                overridden: '已覆盖 ×',
                overrideTip: '该帧形状已被覆盖，点击重置为基础形状',
                areaFrameNav: '区域 第 {current} / {total} 帧',
                defaultShapeTag: '（默认形状）',
                addArea: '添加区域',
                areaType: '类型',
                concealment: '隐蔽度',
                restEfficiency: '休息效率',
                comfort: '舒适度',
                maxFishCount: '最大鱼数',
                foodType: '食物类型',
                foodPerSecond: '生成速率',
                maxFood: '最大食物',
                initialFood: '初始食物',
                isShowFood: '显示食物',
                visibleInFrame: '本帧显示',
                areaOverridden: '已覆盖形状 ×',
                selectAreaTip: '请添加或选择一个区域',
                defaultAreaName: '区域 {index}'
            },
            substrate: {
                title: '基底编辑：{name}',
                nameKey: '名称 Key',
                nameKeyPlaceholder: '例如 substrate.sand.name',
                descriptionKey: '简介 Key',
                descriptionKeyPlaceholder: '例如 substrate.sand.description',
                type: '类型',
                typePlaceholder: '请选择类型',
                thumbnail: '列表头像',
                noAvatar: '无头像',
                clickUpload: '点击上传',
                uploadAvatar: '上传头像',
                removeAvatar: '删除头像',
                thumbnailTip: '推荐尺寸 100 × 100 像素',
                topView: '俯视图',
                frontView: '正视图（剖面）',
                uploadTopView: '点击上传俯视图',
                uploadFrontView: '点击上传正视图',
                width: '宽',
                height: '高',
                upload: '上传',
                remove: '删除'
            },
            glass: {
                title: '玻璃样式编辑：{name}',
                nameKey: '名称 Key',
                nameKeyPlaceholder: '例如 glass.default.name',
                descriptionKey: '简介 Key',
                descriptionKeyPlaceholder: '例如 glass.default.description',
                overallColor: '整体颜色',
                overallColorTip: '仅用于快速统一配色，不会保存到 item.json',
                partTypeColor: '颜色',
                partTypeTexture: '纹理',
                type: '类型',
                typePlaceholder: '请选择类型',
                color: '颜色',
                alpha: '不透明度',
                uploadTexture: '上传纹理',
                removeTexture: '删除纹理',
                texturePlaceholder: '点击上传纹理',
                textureMode: '填充模式',
                textureModePlaceholder: '请选择填充模式',
                preview: '预览',
                generateThumbnail: '从预览生成缩略图',
                partLeftSurface: '左侧玻璃面',
                partBackSurface: '背板玻璃面',
                partFrontSurface: '正面玻璃面',
                partRightSurface: '右侧玻璃面',
                partBottomSurface: '底部玻璃面',
                partGlassEdge: '玻璃边缘'
            },
            options: {
                decorationCategory: {
                    other: '其他',
                    plant: '植物',
                    rock: '岩石',
                    ornament: '摆件',
                    building: '建筑'
                },
                diet: {
                    herbivore: '草食性',
                    carnivore: '肉食性',
                    omnivore: '杂食性',
                    filter: '滤食性',
                    algae: '藻类食性'
                },
                yesNo: {
                    no: '否',
                    yes: '是'
                },
                reproduction: {
                    oviparous: '卵生',
                    viviparous: '胎生',
                    ovoviviparous: '卵胎生'
                },
                dayNight: {
                    diurnal: '日行',
                    nocturnal: '夜行'
                },
                swimMode: {
                    anguilliform: '鳗形 (Anguilliform)',
                    subcarangiform: '亚鲹形 (Subcarangiform)',
                    carangiform: '鲹形 (Carangiform)',
                    thunniform: '鲔形 (Thunniform)',
                    ostraciiform: '箱鲀形 (Ostraciiform)',
                    amiiform: '弓鳍鱼形 (Amiiform)',
                    gymnotiform: '电鳗形 (Gymnotiform)',
                    balistiform: '鳞鲀形 (Balistiform)',
                    tetraodontiform: '鲀形 (Tetraodontiform)',
                    rajiform: '鳐形 (Rajiform)',
                    diodontiform: '刺鲀形 (Diodontiform)',
                    labriform: '隆头鱼形 (Labriform)'
                },
                speciesCategory: {
                    fish: '鱼',
                    shrimp: '虾',
                    crab: '蟹',
                    snail: '螺',
                    bivalve: '贝类'
                },
                areaType: {
                    shelter: '庇护区',
                    food: '食物区'
                },
                foodType: {
                    feed: '人工饲料',
                    algae: '藻类',
                    biofilm: '生物膜',
                    plant: '植物',
                    plankton: '浮游生物'
                },
                tweenType: {
                    none: '无',
                    sway: '摇摆',
                    breathe: '呼吸',
                    rotate: '旋转'
                },
                axis: {
                    x: '水平',
                    y: '垂直'
                },
                substrateType: {
                    texture: '纹理'
                },
                glassPartType: {
                    color: '颜色',
                    texture: '纹理'
                },
                glassTextureMode: {
                    stretch: '拉伸',
                    tile: '平铺'
                }
            }
        }
    }
}