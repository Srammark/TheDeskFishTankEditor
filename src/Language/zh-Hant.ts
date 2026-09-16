export default
{
    language: {
        name: '繁體中文'
    },
    core: {
        setting: {
            item: {
                language: {
                    name: '語言',
                    content: '程式顯示語言'
                }
            }
        },
        service: {
            language: {
                error: {
                    loadLanguagePackageError: '載入語言包異常'
                }
            }
        }
    },
    page: {
        managePackage: {
            packageList: {
                import: '匯入包',
                title: '資源包管理',
                create: '新建包',
                export: '匯出',
                delete: '刪除',
                unnamed: '(未命名)',
                unknownAuthor: '未知作者',
                emptyTip: '暫無資源包，點擊右上角「新建包」或「匯入包」開始',
                promptCreateName: '請輸入新包名稱：',
                confirmDelete: '確定要刪除資源包 "{name}" 嗎？此操作不可撤銷。'
            }
        },
        manageResourcePackage: {
            editor: {
                defaultTitle: '資源擴充包編輯器',
                import: '匯入',
                export: '匯出',
                save: '儲存',
                placeholder: '請在左側選擇一個節點進行編輯',
                promptSpeciesName: '請輸入物種資料夾名稱（拉丁學名，如 PoeciliaReticulata）：',
                promptSpeciesCategory: '請選擇物種類型：\n1. 魚 (Fish)\n2. 蝦 (Shrimp)\n3. 蟹 (Crab)\n4. 螺 (Snail)\n5. 貝類 (Bivalve)\n\n請輸入序號：',
                alertInvalidCategory: '無效的類型序號。',
                confirmRemoveSpecies: '確定要刪除物種 "{name}" 嗎？此操作不可撤銷。',
                promptStrainName: '請輸入新品系名稱（如 Albino）：',
                confirmRemoveStrain: '確定要刪除品系 "{name}" 嗎？',
                promptDecorationName: '請輸入裝飾物資料夾名稱：',
                confirmRemoveDecoration: '確定要刪除裝飾物 "{name}" 嗎？',
                confirmRemoveDecorationPart: '確定要刪除子部件 "{name}" 嗎？',
                promptSubstrateName: '請輸入基底資料夾名稱：',
                confirmRemoveSubstrate: '確定要刪除基底 "{name}" 嗎？',
                promptGlassName: '請輸入玻璃樣式資料夾名稱：',
                confirmRemoveGlass: '確定要刪除玻璃樣式 "{name}" 嗎？',
                alertLanguageExists: '該語言標籤已存在。',
                confirmRemoveLanguage: '確定要刪除語言檔案 "{name}.json" 嗎？'
            },
            tree: {
                title: '擴充包結構',
                packageInfo: '包資訊',
                language: '國際化',
                addLanguage: '新增語言',
                selectLanguage: '選擇語言',
                addSpecies: '新增物種',
                addDecoration: '新增裝飾物',
                addSubstrate: '新增基底',
                addGlass: '新增玻璃樣式',
                addResource: '新增資源',
                defaultPartName: '部件 {index}'
            },
            handler: {
                creature: '生物',
                decoration: '裝飾物',
                substrate: '基底',
                glass: '玻璃樣式',
                speciesDesc: '物種描述',
                sexMale: '雄性',
                sexFemale: '雌性',
                sexFry: '魚苗',
                creatureItem: '生物屬性',
                spriteResource: '精靈圖資源',
                unnamedPart: '未命名部件'
            },
            packageInfo: {
                title: '包資訊 (info.json)',
                name: '名稱',
                namePlaceholder: '包名',
                keywords: '關鍵字',
                keywordsPlaceholder: '關鍵字，以逗號分隔',
                version: '版本',
                author: '作者',
                authorPlaceholder: '作者名稱',
                license: '授權條款'
            },
            language: {
                title: '國際化 (Language/{langTag}.json)',
                importJson: '匯入 JSON',
                hintPrefix: '鍵支援點號路徑，如',
                hintSuffix: '會生成',
                importPlaceholder: '貼上 JSON，如 {\'{\'} "fish": {\'{\'} "name": "孔雀魚" {\'}\'} {\'}\'}',
                cancel: '取消',
                merge: '合併生成條目',
                keyPlaceholder: '鍵（如 a.b.c）',
                valuePlaceholder: '值',
                addEntry: '新增條目',
                preview: '即時預覽',
                alertParseFailed: 'JSON 解析失敗，請檢查格式。',
                alertNotObject: 'JSON 必須是一個物件。'
            },
            speciesDesc: {
                title: '物種描述 (speciesDescription.json)',
                category: '物種類型',
                categoryPlaceholder: '未設定',
                scientificName: '拉丁學名',
                name: '名稱',
                wiki: 'Wiki',
                keyPlaceholder: '國際化字串鍵名'
            },
            strain: {
                title: '品系資訊',
                scientificName: '拉丁學名',
                scientificNamePlaceholder: '繼承自物種描述',
                name: '名稱',
                wiki: 'Wiki',
                keyPlaceholder: '國際化字串鍵名',
                avatar: '品系頭像',
                noAvatar: '無頭像',
                clickUpload: '點擊上傳',
                uploadAvatar: '上傳頭像',
                removeAvatar: '刪除頭像',
                avatarTip: '推薦尺寸 100 × 100 像素，上傳後會自動縮放'
            },
            item: {
                title: '{category}屬性 (item.json)',
                fallbackCategory: '生物',
                base: {
                    speedLimit: '最高速度',
                    visualRadius: '感知半徑',
                    stature: '體型大小',
                    sizeLarge: '大',
                    sizeMedium: '中',
                    sizeSmall: '小',
                    swimmingLevel: '活動水層',
                    levelShallow: '淺',
                    levelDeep: '深',
                    gregariousness: '群居性',
                    idealGroupSize: '理想群數',
                    aggression: '攻擊性',
                    territoriality: '領地意識',
                    diet: '食性',
                    metabolism: '代謝量',
                    stressSensitivity: '壓力敏感',
                    alertness: '警惕性',
                    reproduction: '繁殖方式',
                    temperature: '適宜溫度',
                    lifespan: '壽命',
                    matureAge: '成熟期',
                    litterSize: '每窩數量',
                    hatchTime: '孵化時間',
                    gestationTime: '懷孕時長',
                    dayNightHabit: '晝夜習性'
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
                    section: '魚類專屬',
                    swimMode: '游動模式'
                },
                shrimp: {
                    section: '蝦類專屬',
                    moltCycle: '蛻殼週期',
                    moltVulnerability: '蛻殼脆弱期'
                },
                crab: {
                    section: '蟹類專屬',
                    moltCycle: '蛻殼週期',
                    moltVulnerability: '蛻殼脆弱期'
                },
                bivalve: {
                    section: '貝類專屬',
                    filterRate: '濾水速率'
                }
            },
            sprite: {
                title: '精靈圖資源',
                toCollisionMode: '轉為編輯碰撞體',
                toImageMode: '轉為編輯圖片',
                frameSize: '幀尺寸',
                tipImage: '提示：點擊格子上傳幀圖片',
                tipCollision: '提示：點擊格子選擇要編輯碰撞體的幀',
                actionIdle: '懸浮',
                actionSwim: '游動',
                actionEat: '進食',
                copyToPrev: '複製到上一幀',
                copyToNext: '複製到下一幀',
                copyToAll: '套用到全部幀'
            },
            collision: {
                body: '身體',
                mouth: '嘴部',
                overridden: '已覆蓋 ×',
                overrideTip: '該幀形狀已被覆蓋，點擊重設為基礎形狀',
                createShape: '建立形狀',
                deleteShape: '刪除形狀',
                copyShape: '複製形狀',
                pasteShape: '貼上形狀',
                copied: '已複製：{name}',
                baseShapeTip: '第 1 幀編輯的是基礎形狀（所有幀共用）'
            },
            shapeEditor: {
                shape: '形狀',
                circle: '圓形',
                rectangle: '矩形',
                capsule: '膠囊',
                ellipse: '橢圓',
                polygon: '多邊形',
                pie: '扇形',
                segment: '線段',
                radius: '半徑',
                width: '寬度',
                height: '高度',
                length: '長度',
                sweep: '掃掠角',
                vertex: '頂點',
                vertexHint: '左鍵拖曳 / 右鍵刪除 / 點擊邊新增',
                addVertex: '新增頂點',
                noShape: '目前無形狀',
                delete: '刪除',
                create: '建立'
            },
            animationPreview: {
                title: '動畫預覽',
                play: '播放',
                pause: '暫停',
                showColliders: '顯示碰撞體'
            },
            decoration: {
                previewTitle: '裝飾物預覽：{name}',
                nameKey: '名稱 Key',
                nameKeyPlaceholder: '例如 decoration.apple.name',
                descriptionKey: '簡介 Key',
                descriptionKeyPlaceholder: '例如 decoration.apple.description',
                category: '分類',
                categoryPlaceholder: '請選擇分類',
                thumbnail: '裝飾物縮圖',
                noThumbnail: '無縮圖',
                clickUpload: '點擊上傳',
                uploadThumbnail: '上傳縮圖',
                removeThumbnail: '刪除縮圖',
                thumbnailTip: '推薦尺寸 100 × 100 像素，上傳後會自動等比例縮放',
                noParts: '該裝飾物暫無子部件',
                itemTitle: '裝飾物屬性：{name}',
                selectPartTip: '請在左側樹形選單中選擇一個子部件',
                tabBasic: '基礎',
                tabSprite: '精靈圖',
                tabAnimation: '動畫',
                tabCollider: '碰撞體',
                tabArea: '區域',
                partName: '名稱',
                partZIndex: 'Z 層級',
                uploadSprite: '上傳精靈圖',
                removeSprite: '刪除',
                noSprite: '尚未上傳精靈圖',
                spritePanelTitle: '裝飾物精靈圖資源：{name}',
                spritePanelNoSprite: '無精靈圖',
                animationMode: '動畫模式',
                animationModeNone: '無',
                animationModeTween: '程式化動畫',
                animationModeFrame: '幀動畫',
                animationType: '動畫類型',
                amplitude: '幅度(px)',
                frequency: '頻率(Hz)',
                phase: '相位',
                axis: '方向',
                axisX: '水平',
                axisY: '垂直',
                minScale: '最小縮放',
                maxScale: '最大縮放',
                minAngle: '最小角度',
                maxAngle: '最大角度',
                pivotX: '錨點 X',
                pivotY: '錨點 Y',
                frameSize: '幀尺寸',
                uploadSheet: '上傳雪碧圖',
                uploadFrames: '批次上傳幀',
                addFrame: '新增空幀',
                colliderFrameNav: '碰撞體 第 {current} / {total} 幀',
                defaultConfigTag: '（預設配置）',
                addCollider: '新增碰撞體',
                overridden: '已覆蓋 ×',
                overrideTip: '該幀形狀已被覆蓋，點擊重設為基礎形狀',
                areaFrameNav: '區域 第 {current} / {total} 幀',
                defaultShapeTag: '（預設形狀）',
                addArea: '新增區域',
                areaType: '類型',
                concealment: '隱蔽度',
                restEfficiency: '休息效率',
                comfort: '舒適度',
                maxFishCount: '最大魚數',
                foodType: '食物類型',
                foodPerSecond: '生成速率',
                maxFood: '最大食物',
                initialFood: '初始食物',
                isShowFood: '顯示食物',
                visibleInFrame: '本幀顯示',
                areaOverridden: '已覆蓋形狀 ×',
                selectAreaTip: '請新增或選擇一個區域',
                defaultAreaName: '區域 {index}'
            },
            substrate: {
                title: '基底編輯：{name}',
                nameKey: '名稱 Key',
                nameKeyPlaceholder: '例如 substrate.sand.name',
                descriptionKey: '簡介 Key',
                descriptionKeyPlaceholder: '例如 substrate.sand.description',
                type: '類型',
                typePlaceholder: '請選擇類型',
                thumbnail: '列表頭像',
                noAvatar: '無頭像',
                clickUpload: '點擊上傳',
                uploadAvatar: '上傳頭像',
                removeAvatar: '刪除頭像',
                thumbnailTip: '推薦尺寸 100 × 100 像素',
                topView: '俯視圖',
                frontView: '正視圖（剖面）',
                uploadTopView: '點擊上傳俯視圖',
                uploadFrontView: '點擊上傳正視圖',
                width: '寬',
                height: '高',
                upload: '上傳',
                remove: '刪除'
            },
            glass: {
                title: '玻璃樣式編輯：{name}',
                nameKey: '名稱 Key',
                nameKeyPlaceholder: '例如 glass.default.name',
                descriptionKey: '簡介 Key',
                descriptionKeyPlaceholder: '例如 glass.default.description',
                overallColor: '整體顏色',
                overallColorTip: '僅用於快速統一配色，不會儲存到 item.json',
                partTypeColor: '顏色',
                partTypeTexture: '紋理',
                type: '類型',
                typePlaceholder: '請選擇類型',
                color: '顏色',
                alpha: '不透明度',
                uploadTexture: '上傳紋理',
                removeTexture: '刪除紋理',
                texturePlaceholder: '點擊上傳紋理',
                textureMode: '填充模式',
                textureModePlaceholder: '請選擇填充模式',
                preview: '預覽',
                generateThumbnail: '從預覽生成縮圖',
                partLeftSurface: '左側玻璃面',
                partBackSurface: '背板玻璃面',
                partFrontSurface: '正面玻璃面',
                partRightSurface: '右側玻璃面',
                partBottomSurface: '底部玻璃面',
                partGlassEdge: '玻璃邊緣'
            },
            options: {
                decorationCategory: {
                    other: '其他',
                    plant: '植物',
                    rock: '岩石',
                    ornament: '擺件',
                    building: '建築'
                },
                diet: {
                    herbivore: '草食性',
                    carnivore: '肉食性',
                    omnivore: '雜食性',
                    filter: '濾食性',
                    algae: '藻類食性'
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
                    anguilliform: '鰻形 (Anguilliform)',
                    subcarangiform: '亞鯵形 (Subcarangiform)',
                    carangiform: '鯵形 (Carangiform)',
                    thunniform: '鮪形 (Thunniform)',
                    ostraciiform: '箱魨形 (Ostraciiform)',
                    amiiform: '弓鰭魚形 (Amiiform)',
                    gymnotiform: '電鰻形 (Gymnotiform)',
                    balistiform: '鱗魨形 (Balistiform)',
                    tetraodontiform: '魨形 (Tetraodontiform)',
                    rajiform: '鰩形 (Rajiform)',
                    diodontiform: '刺魨形 (Diodontiform)',
                    labriform: '隆頭魚形 (Labriform)'
                },
                speciesCategory: {
                    fish: '魚',
                    shrimp: '蝦',
                    crab: '蟹',
                    snail: '螺',
                    bivalve: '貝類'
                },
                areaType: {
                    shelter: '庇護區',
                    food: '食物區'
                },
                foodType: {
                    feed: '人工飼料',
                    algae: '藻類',
                    biofilm: '生物膜',
                    plant: '植物',
                    plankton: '浮游生物'
                },
                tweenType: {
                    none: '無',
                    sway: '搖擺',
                    breathe: '呼吸',
                    rotate: '旋轉'
                },
                axis: {
                    x: '水平',
                    y: '垂直'
                },
                substrateType: {
                    texture: '紋理'
                },
                glassPartType: {
                    color: '顏色',
                    texture: '紋理'
                },
                glassTextureMode: {
                    stretch: '拉伸',
                    tile: '平鋪'
                }
            }
        }
    }
}