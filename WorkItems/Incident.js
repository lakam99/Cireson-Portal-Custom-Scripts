{
    "Default":{
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
                            name: "IncidentInformation",
                            rows: [                                
                                {
                                    columnFieldList: [
                                        { DataType: "UserPicker", PropertyDisplayName: "AffectedUser", PropertyName: "RequestedWorkItem" },
                                        { DataType: "String", PropertyDisplayName: "Alternatecontactmethod", PropertyName: "ContactMethod", ColSpan: 1, MinLength: 0, MaxLength: 256 },
                                        { DataType: "String", PropertyDisplayName: "TFS Ticket#", PropertyName: "TFSTicketNumber", MinLength: 0, MaxLength: 40 }
                                    ],
                                },
                                {
                                    columnFieldList: [
                                        { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: true, MinLength: 0, MaxLength: 200 }
                                    ],
                                },
                                {
                                    columnFieldList: [
                                        { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", MinLength: 0, MaxLength: 4000 }
                                    ],
                                },
                                { 
                                    columnFieldList:
                                    [
                                        { DataType: "Enum", PropertyDisplayName: "Classification", PropertyName: "Classification", EnumId: '1f77f0ce-9e43-340f-1fd5-b11cc36c9cba' },
                                        { DataType: "Enum", PropertyDisplayName: "Source", PropertyName: "Source", EnumId: '5d59071e-69b3-7ef4-6dee-aacc5b36d898' },
                                    ]
                                },
                                {
                                    columnFieldList:
                                    [
                                            { DataType: "Enum", PropertyDisplayName: "Impact", PropertyName: "Impact", EnumId: '11756265-f18e-e090-eed2-3aa923a4c872', Required: true },
                                            { DataType: "Enum", PropertyDisplayName: "Urgency", PropertyName: "Urgency", EnumId: '04b28bfb-8898-9af3-009b-979e58837852', Required: true },
                                            { DataType: "String", PropertyDisplayName: "Priority", PropertyName: "Priority", Disabled: true },
                                    ]
                                },
                                {
                                    columnFieldList: 
                                    [
                                        { DataType: "Enum", PropertyDisplayName: "SupportGroup", PropertyName: "TierQueue", EnumId: 'c3264527-a501-029f-6872-31300080b3bf'},
                                        { DataType: "UserPicker", PropertyDisplayName: "AssignedTo", PropertyName: "AssignedWorkItem", FilterByAnalyst: false  },
                                        { DataType: "UserPicker", PropertyDisplayName: "PrimaryOwner", PropertyName: "RelatesToIncident", FilterByAnalyst: true},
                                    ]
                                },
                                {
                                    columnFieldList: [
                                        { DataType: "Boolean", PropertyDisplayName: "Escalated", PropertyName: "Escalated", Required: false, Inline: true }
                                    ],
                                }
                            ]
                        },                        
                        {
                            name: "ActionLog",
                            type: "actionLog"
                        },
                        {
                            name: "AffectedConfigurationItems",
                            type: "affectedItems"
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
                            type: "activities",
                            defaultview: "diagram"
                        }
                    ]
                }
            ]
        },
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
                            name: "RelatedConfigurationItems",
                            type: "relatedItems"
                        },
                        {
                            name: "ChildWorkIems",
                            type: "childWorkItems"
                        },
                        {
                            name: "FileAttachments",
                            type: "fileAttachmentsDragDrop"
                        },
                        {
                            name: "WorkItems",
                            type: "multipleObjectPicker",
                            PropertyName: "RelatesToWorkItem",
                            ClassId: "f59821e2-0364-ed2c-19e3-752efbb1ece9",
                            PropertyToDisplay: {Id:"Id",Title:"Title","Status.Name":"Status", LastModified:"LastModified"},
                            SelectableRow: true,
                            SelectProperty: "Id"
                        },
                        {
                              name: "KnowledgeArticle",
                              type: "knowledgeArticle",
                        },
                        {
                            name: "WatchList",
                            type: "multipleObjectPicker",
                            PropertyName: "WatchList",
                            ClassId: "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
                            PropertyToDisplay: {FirstName:"FirstName",LastName:"LastName",Title:"Title",UserName:"Username",Domain:"Domain",Company:"Company"},
                            Visible: session.consoleSetting.DashboardsLicense.IsValid && session.enableWatchlist
                        }
                    ]
                }
            ]
        },
        /*********/
        /** TAB **/
        /*********/
        {
            name: "Resolution",
            content: [
                {
                    customFieldGroupList: [
                        {
                            name: "Resolution",
                            rows:[
                                {
                                    columnFieldList: [
                                        { DataType: "DateTime", PropertyDisplayName: "Resolveddate", PropertyName: "ResolvedDate", Disabled: true },
                                        { DataType: "UserPicker", PropertyDisplayName: "ResolvedByUser", PropertyName: "RelatesToTroubleTicket", Disabled: true }
                                    ],
                                }
                            ]
                        },
                        {
                            name: "TimeWorked",
                            type: "billableTime"
                        },
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
        }
    ]
},
    "DefaultEndUser":{
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
                                name: "IncidentInformation",
                                rows: [                                
                                    {
                                        columnFieldList: [
                                            { DataType: "UserPicker", PropertyDisplayName: "AffectedUser", PropertyName: "RequestedWorkItem", Disabled:true },
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
                                            { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", MinLength: 0, MaxLength: 4000, Disabled:true }
                                        ],
                                    }
                                ]
                            },                        
                            {
                                name: "ActionLog",
                                type: "actionLog"
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
                            }
                        ]
                    }]
            }
        ]
    }
}
