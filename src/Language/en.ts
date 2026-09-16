export default
{
    language: {
        name: 'Simplified Chinese'
    },
    core: {
        setting: {
            item: {
                language: {
                    name: 'Language',
                    content: 'Program display language'
                }
            }
        },
        service: {
            language: {
                error: {
                    loadLanguagePackageError: 'Failed to load language package'
                }
            }
        }
    },
    page: {
        managePackage: {
            packageList: {
                import: 'Import Package',
                title: 'Resource Package Management',
                create: 'Create Package',
                export: 'Export',
                delete: 'Delete',
                unnamed: '(Unnamed)',
                unknownAuthor: 'Unknown Author',
                emptyTip: 'No resource packages. Click "Create Package" or "Import Package" in the top-right corner to get started.',
                promptCreateName: 'Please enter the new package name:',
                confirmDelete: 'Are you sure you want to delete the resource package "{name}"? This action cannot be undone.'
            }
        },
        manageResourcePackage: {
            editor: {
                defaultTitle: 'Resource Extension Package Editor',
                import: 'Import',
                export: 'Export',
                save: 'Save',
                placeholder: 'Please select a node on the left to edit',
                promptSpeciesName: 'Please enter the species folder name (Latin scientific name, e.g. PoeciliaReticulata):',
                promptSpeciesCategory: 'Please select the species type:\n1. Fish\n2. Shrimp\n3. Crab\n4. Snail\n5. Bivalve\n\nPlease enter the number:',
                alertInvalidCategory: 'Invalid type number.',
                confirmRemoveSpecies: 'Are you sure you want to delete the species "{name}"? This action cannot be undone.',
                promptStrainName: 'Please enter the new strain name (e.g. Albino):',
                confirmRemoveStrain: 'Are you sure you want to delete the strain "{name}"?',
                promptDecorationName: 'Please enter the decoration folder name:',
                confirmRemoveDecoration: 'Are you sure you want to delete the decoration "{name}"?',
                confirmRemoveDecorationPart: 'Are you sure you want to delete the sub-part "{name}"?',
                promptSubstrateName: 'Please enter the substrate folder name:',
                confirmRemoveSubstrate: 'Are you sure you want to delete the substrate "{name}"?',
                promptGlassName: 'Please enter the glass style folder name:',
                confirmRemoveGlass: 'Are you sure you want to delete the glass style "{name}"?',
                alertLanguageExists: 'This language tag already exists.',
                confirmRemoveLanguage: 'Are you sure you want to delete the language file "{name}.json"?'
            },
            tree: {
                title: 'Extension Package Structure',
                packageInfo: 'Package Information',
                language: 'Localization',
                addLanguage: 'Add Language',
                selectLanguage: 'Select Language',
                addSpecies: 'Add Species',
                addDecoration: 'Add Decoration',
                addSubstrate: 'Add Substrate',
                addGlass: 'Add Glass Style',
                addResource: 'Add Resource',
                defaultPartName: 'Part {index}'
            },
            handler: {
                creature: 'Creature',
                decoration: 'Decoration',
                substrate: 'Substrate',
                glass: 'Glass Style',
                speciesDesc: 'Species Description',
                sexMale: 'Male',
                sexFemale: 'Female',
                sexFry: 'Fry',
                creatureItem: 'Creature Properties',
                spriteResource: 'Sprite Resource',
                unnamedPart: 'Unnamed Part'
            },
            packageInfo: {
                title: 'Package Information (info.json)',
                name: 'Name',
                namePlaceholder: 'Package name',
                keywords: 'Keywords',
                keywordsPlaceholder: 'Keywords, separated by commas',
                version: 'Version',
                author: 'Author',
                authorPlaceholder: 'Author name',
                license: 'License'
            },
            language: {
                title: 'Localization (Language/{langTag}.json)',
                importJson: 'Import JSON',
                hintPrefix: 'Keys support dot notation paths, e.g.',
                hintSuffix: 'will generate',
                importPlaceholder: 'Paste JSON, e.g. {\'{\'} "fish": {\'{\'} "name": "Guppy" {\'}\'} {\'}\'}',
                cancel: 'Cancel',
                merge: 'Merge and Generate Entries',
                keyPlaceholder: 'Key (e.g. a.b.c)',
                valuePlaceholder: 'Value',
                addEntry: 'Add Entry',
                preview: 'Live Preview',
                alertParseFailed: 'Failed to parse JSON. Please check the format.',
                alertNotObject: 'JSON must be an object.'
            },
            speciesDesc: {
                title: 'Species Description (speciesDescription.json)',
                category: 'Species Type',
                categoryPlaceholder: 'Not Set',
                scientificName: 'Scientific Name',
                name: 'Name',
                wiki: 'Wiki',
                keyPlaceholder: 'Localization string key'
            },
            strain: {
                title: 'Strain Information',
                scientificName: 'Scientific Name',
                scientificNamePlaceholder: 'Inherited from species description',
                name: 'Name',
                wiki: 'Wiki',
                keyPlaceholder: 'Localization string key',
                avatar: 'Strain Avatar',
                noAvatar: 'No Avatar',
                clickUpload: 'Click to Upload',
                uploadAvatar: 'Upload Avatar',
                removeAvatar: 'Remove Avatar',
                avatarTip: 'Recommended size: 100 × 100 pixels. The image will be automatically scaled after upload.'
            },
            item: {
                title: '{category} Properties (item.json)',
                fallbackCategory: 'Creature',
                base: {
                    speedLimit: 'Maximum Speed',
                    visualRadius: 'Perception Radius',
                    stature: 'Body Size',
                    sizeLarge: 'Large',
                    sizeMedium: 'Medium',
                    sizeSmall: 'Small',
                    swimmingLevel: 'Swimming Depth',
                    levelShallow: 'Shallow',
                    levelDeep: 'Deep',
                    gregariousness: 'Gregariousness',
                    idealGroupSize: 'Ideal Group Size',
                    aggression: 'Aggressiveness',
                    territoriality: 'Territoriality',
                    diet: 'Diet',
                    metabolism: 'Metabolic Rate',
                    stressSensitivity: 'Stress Sensitivity',
                    alertness: 'Alertness',
                    reproduction: 'Reproduction',
                    temperature: 'Suitable Temperature',
                    lifespan: 'Lifespan',
                    matureAge: 'Maturity Age',
                    litterSize: 'Litter Size',
                    hatchTime: 'Hatching Time',
                    gestationTime: 'Gestation Period',
                    dayNightHabit: 'Day/Night Activity'
                },
                unit: {
                    mmPerSecond: 'mm/s',
                    mm: 'mm',
                    mgPerDay: 'mg/day',
                    year: 'year',
                    month: 'month',
                    day: 'day',
                    mlPerSecond: 'mL/s'
                },
                fish: {
                    section: 'Fish-Specific',
                    swimMode: 'Swimming Mode'
                },
                shrimp: {
                    section: 'Shrimp-Specific',
                    moltCycle: 'Molting Cycle',
                    moltVulnerability: 'Molting Vulnerability Period'
                },
                crab: {
                    section: 'Crab-Specific',
                    moltCycle: 'Molting Cycle',
                    moltVulnerability: 'Molting Vulnerability Period'
                },
                bivalve: {
                    section: 'Bivalve-Specific',
                    filterRate: 'Filtration Rate'
                }
            },
            sprite: {
                title: 'Sprite Resources',
                toCollisionMode: 'Edit Colliders',
                toImageMode: 'Edit Images',
                frameSize: 'Frame Size',
                tipImage: 'Tip: Click a cell to upload a frame image',
                tipCollision: 'Tip: Click a cell to select the frame whose colliders you want to edit',
                actionIdle: 'Idle',
                actionSwim: 'Swim',
                actionEat: 'Eat',
                copyToPrev: 'Copy to Previous Frame',
                copyToNext: 'Copy to Next Frame',
                copyToAll: 'Apply to All Frames'
            },
            collision: {
                body: 'Body',
                mouth: 'Mouth',
                overridden: 'Overridden ×',
                overrideTip: 'The shape for this frame has been overridden. Click to reset it to the base shape.',
                createShape: 'Create Shape',
                deleteShape: 'Delete Shape',
                copyShape: 'Copy Shape',
                pasteShape: 'Paste Shape',
                copied: 'Copied: {name}',
                baseShapeTip: 'Frame 1 edits the base shape (shared by all frames)'
            },
            shapeEditor: {
                shape: 'Shape',
                circle: 'Circle',
                rectangle: 'Rectangle',
                capsule: 'Capsule',
                ellipse: 'Ellipse',
                polygon: 'Polygon',
                pie: 'Pie',
                segment: 'Line Segment',
                radius: 'Radius',
                width: 'Width',
                height: 'Height',
                length: 'Length',
                sweep: 'Sweep Angle',
                vertex: 'Vertex',
                vertexHint: 'Left-drag to move / Right-click to delete / Click an edge to add',
                addVertex: 'Add Vertex',
                noShape: 'No Shape',
                delete: 'Delete',
                create: 'Create'
            },
            animationPreview: {
                title: 'Animation Preview',
                play: 'Play',
                pause: 'Pause',
                showColliders: 'Show Colliders'
            },
            decoration: {
                previewTitle: 'Decoration Preview: {name}',
                nameKey: 'Name Key',
                nameKeyPlaceholder: 'e.g. decoration.apple.name',
                descriptionKey: 'Description Key',
                descriptionKeyPlaceholder: 'e.g. decoration.apple.description',
                category: 'Category',
                categoryPlaceholder: 'Please select a category',
                thumbnail: 'Decoration Thumbnail',
                noThumbnail: 'No Thumbnail',
                clickUpload: 'Click to Upload',
                uploadThumbnail: 'Upload Thumbnail',
                removeThumbnail: 'Remove Thumbnail',
                thumbnailTip: 'Recommended size: 100 × 100 pixels. The image will be scaled proportionally after upload.',
                noParts: 'This decoration has no sub-parts',
                itemTitle: 'Decoration Properties: {name}',
                selectPartTip: 'Please select a sub-part from the tree menu on the left',
                tabBasic: 'Basic',
                tabSprite: 'Sprite',
                tabAnimation: 'Animation',
                tabCollider: 'Collider',
                tabArea: 'Area',
                partName: 'Name',
                partZIndex: 'Z-Index',
                uploadSprite: 'Upload Sprite',
                removeSprite: 'Delete',
                noSprite: 'No sprite uploaded',
                spritePanelTitle: 'Decoration Sprite Resources: {name}',
                spritePanelNoSprite: 'No Sprite',
                animationMode: 'Animation Mode',
                animationModeNone: 'None',
                animationModeTween: 'Procedural Animation',
                animationModeFrame: 'Frame Animation',
                animationType: 'Animation Type',
                amplitude: 'Amplitude (px)',
                frequency: 'Frequency (Hz)',
                phase: 'Phase',
                axis: 'Direction',
                axisX: 'Horizontal',
                axisY: 'Vertical',
                minScale: 'Minimum Scale',
                maxScale: 'Maximum Scale',
                minAngle: 'Minimum Angle',
                maxAngle: 'Maximum Angle',
                pivotX: 'Pivot X',
                pivotY: 'Pivot Y',
                frameSize: 'Frame Size',
                uploadSheet: 'Upload Sprite Sheet',
                uploadFrames: 'Batch Upload Frames',
                addFrame: 'Add Empty Frame',
                colliderFrameNav: 'Collider — Frame {current} / {total}',
                defaultConfigTag: '(Default Configuration)',
                addCollider: 'Add Collider',
                overridden: 'Overridden ×',
                overrideTip: 'The shape for this frame has been overridden. Click to reset it to the base shape.',
                areaFrameNav: 'Area — Frame {current} / {total}',
                defaultShapeTag: '(Default Shape)',
                addArea: 'Add Area',
                areaType: 'Type',
                concealment: 'Concealment',
                restEfficiency: 'Rest Efficiency',
                comfort: 'Comfort',
                maxFishCount: 'Maximum Fish Count',
                foodType: 'Food Type',
                foodPerSecond: 'Spawn Rate',
                maxFood: 'Maximum Food',
                initialFood: 'Initial Food',
                isShowFood: 'Show Food',
                visibleInFrame: 'Visible in This Frame',
                areaOverridden: 'Overridden Shape ×',
                selectAreaTip: 'Please add or select an area',
                defaultAreaName: 'Area {index}'
            },
            substrate: {
                title: 'Substrate Editor: {name}',
                nameKey: 'Name Key',
                nameKeyPlaceholder: 'e.g. substrate.sand.name',
                descriptionKey: 'Description Key',
                descriptionKeyPlaceholder: 'e.g. substrate.sand.description',
                type: 'Type',
                typePlaceholder: 'Please select a type',
                thumbnail: 'List Thumbnail',
                noAvatar: 'No Avatar',
                clickUpload: 'Click to Upload',
                uploadAvatar: 'Upload Avatar',
                removeAvatar: 'Remove Avatar',
                thumbnailTip: 'Recommended size: 100 × 100 pixels',
                topView: 'Top View',
                frontView: 'Front View (Cross-Section)',
                uploadTopView: 'Click to Upload Top View',
                uploadFrontView: 'Click to Upload Front View',
                width: 'Width',
                height: 'Height',
                upload: 'Upload',
                remove: 'Delete'
            },
            glass: {
                title: 'Glass Style Editor: {name}',
                nameKey: 'Name Key',
                nameKeyPlaceholder: 'e.g. glass.default.name',
                descriptionKey: 'Description Key',
                descriptionKeyPlaceholder: 'e.g. glass.default.description',
                overallColor: 'Overall Color',
                overallColorTip: 'Only used for quickly applying a unified color scheme; it will not be saved to item.json.',
                partTypeColor: 'Color',
                partTypeTexture: 'Texture',
                type: 'Type',
                typePlaceholder: 'Please select a type',
                color: 'Color',
                alpha: 'Opacity',
                uploadTexture: 'Upload Texture',
                removeTexture: 'Remove Texture',
                texturePlaceholder: 'Click to upload texture',
                textureMode: 'Fill Mode',
                textureModePlaceholder: 'Please select a fill mode',
                preview: 'Preview',
                generateThumbnail: 'Generate Thumbnail from Preview',
                partLeftSurface: 'Left Glass Surface',
                partBackSurface: 'Back Glass Surface',
                partFrontSurface: 'Front Glass Surface',
                partRightSurface: 'Right Glass Surface',
                partBottomSurface: 'Bottom Glass Surface',
                partGlassEdge: 'Glass Edge'
            },
            options: {
                decorationCategory: {
                    other: 'Other',
                    plant: 'Plant',
                    rock: 'Rock',
                    ornament: 'Ornament',
                    building: 'Building'
                },
                diet: {
                    herbivore: 'Herbivorous',
                    carnivore: 'Carnivorous',
                    omnivore: 'Omnivorous',
                    filter: 'Filter-Feeding',
                    algae: 'Algae-Eating'
                },
                yesNo: {
                    no: 'No',
                    yes: 'Yes'
                },
                reproduction: {
                    oviparous: 'Oviparous',
                    viviparous: 'Viviparous',
                    ovoviviparous: 'Ovoviviparous'
                },
                dayNight: {
                    diurnal: 'Diurnal',
                    nocturnal: 'Nocturnal'
                },
                swimMode: {
                    anguilliform: 'Anguilliform',
                    subcarangiform: 'Subcarangiform',
                    carangiform: 'Carangiform',
                    thunniform: 'Thunniform',
                    ostraciiform: 'Ostraciiform',
                    amiiform: 'Amiiform',
                    gymnotiform: 'Gymnotiform',
                    balistiform: 'Balistiform',
                    tetraodontiform: 'Tetraodontiform',
                    rajiform: 'Rajiform',
                    diodontiform: 'Diodontiform',
                    labriform: 'Labriform'
                },
                speciesCategory: {
                    fish: 'Fish',
                    shrimp: 'Shrimp',
                    crab: 'Crab',
                    snail: 'Snail',
                    bivalve: 'Bivalve'
                },
                areaType: {
                    shelter: 'Shelter Area',
                    food: 'Food Area'
                },
                foodType: {
                    feed: 'Artificial Feed',
                    algae: 'Algae',
                    biofilm: 'Biofilm',
                    plant: 'Plant',
                    plankton: 'Plankton'
                },
                tweenType: {
                    none: 'None',
                    sway: 'Sway',
                    breathe: 'Breathe',
                    rotate: 'Rotate'
                },
                axis: {
                    x: 'Horizontal',
                    y: 'Vertical'
                },
                substrateType: {
                    texture: 'Texture'
                },
                glassPartType: {
                    color: 'Color',
                    texture: 'Texture'
                },
                glassTextureMode: {
                    stretch: 'Stretch',
                    tile: 'Tile'
                }
            }
        }
    }
}