//Written by Geoff Ross
$(document).ready(function() {

    if (!session.user.Analyst) {
        return;
    }
    
    var ciClasses = [
        {
            displayName: "Domain User",
            classId: "eca3c52a-f273-5cdc-f165-3eb95a2b26cf",
            icon: "fa-user"
        }
    ];

    var menu1 = `
    <li class="drawer-button config-item-drawer0" data-click="open" data-desc="Create Configuration Item" data-click-template="">
        <i class="drawer-icon fa fa-desktop"></i>
        <span class="drawermenu-tile-link">Configuration Item</span>
    </li>`;

    var menu2 = `
    <div class="drawermenu-tile" data-level="1" style="width: auto; overflow: hidden auto; display: block;">
        <ul>
            <!-- Drawer Menu Select type -->
            <li class="drawermenu-select-type visible-xs"><a><span>Select Type</span></a></li>
            <!-- Drawer Menu Tile Item THIS SECTION GETS REPEATED FOR EACH MENU ITEM -->`;

    ciClasses.forEach(function(ciClass) { 
        
        menu2 += `        <li class="drawer-button config-item-drawer1" data-click="open" data-desc="` + ciClass.displayName + `" data-click-template="` + ciClass.classId + `">
                <i class="drawer-icon fa fa-` + ciClass.icon + `"></i>
                <span class="drawermenu-tile-link">` + ciClass.displayName + `</span>
            </li>`;
    });

    menu2 += `    </ul>
    </div>`;

    $('.drawermenu-tile[data-level="0"] > ul').append(menu1);

    $('.config-item-drawer0').hover(
        function () {
            $('.drawerdetails-details-box').text("Create Configuration Item");
        },
        function (){  }
    ).click(function () {
        $('.drawermenu-menu > .drawermenu-tile[data-level="1"]').remove();
        $('.drawermenu-tile[data-level="0"]').after(menu2);
        
        $('.drawermenu-tile[data-level="0"] > ul > li').removeClass('drawermenu-selected');
        $('.config-item-drawer0').addClass('drawermenu-selected');
        $('.config-item-drawer1').hover(
            function () {
                $('.drawerdetails-details-box').text("Create " + this.attributes["data-desc"].value);
            },
            function (){  }
        ).click(function () {
            newCI(this.attributes["data-click-template"].value);
            $('.drawermenu-tile[data-level="1"] > ul > li').removeClass('drawermenu-selected');
            $('.config-item-drawer1').addClass('drawermenu-selected');
        });
    });
});

function newCI (classId) {
    ciObject = {
        ObjectStatus: {
            Id: "acdcedb7-100c-8c91-d664-4629a218bd94"
        },
        ClassTypeId: classId,
        Domain: "nserc",
        TimeAdded: "0001-01-01T00:00:00.000Z"
    };
    
    var strData = {
        formJson: {
            original: null,
            current: ciObject
        }
    };
    
    $.ajax({
        url: "/api/V3/Projection/Commit",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(strData),
        success: function (commitResponse) {
            window.location.href = "/DynamicData/Edit/" + commitResponse.BaseId;
        }
    });	
}