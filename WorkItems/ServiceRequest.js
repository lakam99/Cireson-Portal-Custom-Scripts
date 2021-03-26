{
    "Default": {
        tabList: [
            /*********/
            /** TAB **/
            /*********/
            {
                name: "General",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "ServiceRequestInformation",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "UserPicker", PropertyDisplayName: "AffectedUser", PropertyName: "RequestedWorkItem" },
                                            { DataType: "String", PropertyDisplayName: "Alternatecontactmethod", PropertyName: "ContactMethod", ColSpan: 2, MinLength: 0, MaxLength: 256 }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: true, MinLength: 0, MaxLength: 200 }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", MinLength: 0, MaxLength: 4000}
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "Urgency", PropertyName: "Urgency", EnumId: 'eb35f771-8b0a-41aa-18fb-0432dfd957c4' },
                                            { DataType: "Enum", PropertyDisplayName: "Priority", PropertyName: "Priority", EnumId: 'd55e65ea-fae9-f7db-0937-843bfb1367c0' },
                                            { DataType: "Enum", PropertyDisplayName: "Source", PropertyName: "Source", EnumId: '848211a2-393a-6ec5-9c97-8e1e0cfebba2' },
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "Area", PropertyName: "Area", EnumId: "3880594c-dc54-9307-93e4-45a18bb0e9e1"},
                                            { DataType: "Enum", PropertyDisplayName: "SupportGroup", PropertyName: "SupportGroup", EnumId: "23c243f6-9365-d46f-dff2-03826e24d228" },
                                            { DataType: "UserPicker", PropertyDisplayName: "AssignedTo", PropertyName: "AssignedWorkItem" },
                                        ],
                                    },
                                ]
                            },
                            {
                                name: "UserInput",
                                type: "userInput"
                            },
                            {
                                name: "ActionLog",
                                type: "actionLog"
                            }
                        ]
                    }]
            },
            /*********/
            /** TAB **/
            /*********/
            {
                name: "Activities",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Activities",
                                type: "activities"
                            }
                        ]
                    }
                ]
            },
            /*********/
            /** TAB **/
            /*********/
            {
                name: "Results",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Results",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "ImplementationResults", PropertyName: "ImplementationResults", EnumId: '4ea37c27-9b24-615a-94da-510539371f4c' },
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "LongString", PropertyDisplayName: "Implementationnotes", PropertyName: "Notes", MinLength: 0, MaxLength: 4000 }
                                        ]
                                    },
									{
										 columnFieldList: [
											{ DataType: "String", PropertyDisplayName: "TFS Ticket#", PropertyName: "TFSTicketNumber", MinLength: 0, MaxLength: 40 }
										]
									}
                                ]
                                    
                            },
                            {
                                name: "TimeWorked",
                                type: "billableTime"
                            }
                        ]
                    }
                ]
            },
            /*********/
            /** TAB **/
            /*********/
            {
                name: "RelatedItems",
                content: [
                    {
                        customFieldGroupList: [
							{
                                name: "Related Work Items",
                                type: "multipleObjectPicker",
                                PropertyName: "RelatesToWorkItem",
                                ClassId: "f59821e2-0364-ed2c-19e3-752efbb1ece9",
                                PropertyToDisplay: {Id:"Id",Title:"Title","Status.Name":"Status",LastModified:"LastModified"},
                                SelectableRow: true,
                                SelectProperty: "Id"
                            },
                            {
                                name: "FileAttachments",
                                type: "fileAttachmentsDragDrop"
                            },
							{
                                name: "WatchList",
                                type: "multipleObjectPicker",
                                PropertyName: "WatchList",
                                ClassId: "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
                                PropertyToDisplay: {FirstName:"FirstName",LastName:"LastName",Title:"Title",UserName:"Username",Domain:"Domain",Company:"Company"},
                                Visible: session.consoleSetting.DashboardsLicense.IsValid && session.enableWatchlist
                            },
							{
                                name: "RelatedConfigurationItems",
                                type: "relatedItems"
                            },
							{
                                name: "AffectedConfigurationItems",
                                type: "affectedItems"
                            },
                            {
                                name: "ChildWorkIems",
                                type: "childWorkItems"
                            },
                            {
                                name: "KnowledgeArticle",
                                type: "knowledgeArticle",
                            }
                        ]
                    }
                ]
            },
            /*********/
            /** TAB **/
            /*********/
            {
                name: "History",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "History",
                                type: "history"
                            }
                        ]
                    }
                ]
            },
            /*********/
            /** TAB **/
            /*********/
            {
                name: "Additional Info",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Award #",
                                DataType: "String",
                                MaxLength: 256,
                                PropertyName: "CASDAwardNumber",
                                PropertyDisplayName: "Award #"
                            },

                            {
                                name: "Agency",
                                DataType: "Enum",
                                PropertyName: "CASD_Agencies",
                                PropertyDisplayName: "Agency",
                                EnumId: "e08292af-f5ee-786b-1d1f-b59ef8950df1"
                            },

                            {
                                name: "University / Institution",
                                DataType: "Enum",
                                PropertyName: "CASD_Universities",
                                PropertyDisplayName: "Universities / Institutions",
                                EnumId: "2cec693b-fbc1-15e2-3545-706de8373a12"
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "DefaultEndUser": {
        tabList: [
            /*********/
            /** TAB **/
            /*********/
            {
                name: "General",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "ServiceRequestInformation",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "UserPicker", PropertyDisplayName: "AffectedUser", PropertyName: "RequestedWorkItem", Disabled:true},
                                            { DataType: "String", PropertyDisplayName: "Alternatecontactmethod", PropertyName: "ContactMethod", ColSpan: 2, MinLength: 0, MaxLength: 256 }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: true, MinLength: 0, MaxLength: 200, Disabled:true }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", MinLength: 0, MaxLength: 4000, Disabled:true}
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "UserInput",
                                type: "userInput"
                            },
                            {
                                name: "ActionLog",
                                type: "actionLog"
                            },
                            {
                                name: "Activities",
                                type: "activities", 
                                disabled: "true"
                            }
                        ]
                    }]
            },
            /*********/
            /** TAB **/
            /*********/
            {
                name: "RelatedItems",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "RelatedConfigurationItems",
                                type: "relatedItems"
                            },
                            {
                                name: "AffectedConfigurationItems",
                                type: "affectedItems"
                            },
                            {
                                name: "FileAttachments",
                                type: "fileAttachmentsDragDrop"
                            },
                            {
                                name: "WatchList",
                                type: "multipleObjectPicker",
                                PropertyName: "WatchList",
                                ClassId: "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
                                PropertyToDisplay: {FirstName:"FirstName",LastName:"LastName",Title:"Title",UserName:"Username",Domain:"Domain",Company:"Company"},
                                Visible: session.consoleSetting.DashboardsLicense.IsValid && session.enableWatchlist
                            },
                        ]
                    }
                ]
            }
        ]
    }        
}
