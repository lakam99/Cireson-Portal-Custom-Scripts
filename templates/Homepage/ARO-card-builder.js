var AROCardBuilder = {
    build_aro: function(aro_obj) {
        aro_obj.type = 'aro';
        return `
            <div class="ark-sm-3">
                <div class="my-card">
                <div class="my-card-body">
                    <img src="${window.location.origin + "/ServiceCatalog/GetRequestOfferingImg/" + aro_obj.RequestOfferingId}" alt="${aro_obj.RequestOfferingTitle}">
                    <div class="my-card-text">
                    <h5 class="card-title">${aro_obj.RequestOfferingTitle}</h5>
                    <div class="my-card-text-body">
                        ${aro_obj.RequestOfferingDescription}
                    </div>
                    </div>
                    <div class='aro-button-container'>
                        <a target="_blank" href='${window.location.origin + "/SC/ServiceCatalog/RequestOffering/" + aro_obj.RequestOfferingId + "," + aro_obj.ServiceOfferingId}' class="btn btn-primary aro-btn">${ aro_obj.type == 'aro' ? 'Start request':'Start reading' }</a>
                    </div>
                </div>
                </div>
            </div>
        `;
    },

    build_service_page(service_obj) {
        var r = '<div class="my-flex">';
        service_obj.forEach((aro_obj)=>{
            r += AROCardBuilder.build_aro(aro_obj);
        });
        r += '</div>';
        return r;
    }
}