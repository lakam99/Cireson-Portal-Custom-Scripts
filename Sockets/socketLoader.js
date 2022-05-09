var SocketLoader = {
    providers: '/CustomSpace/Sockets/providers.json',
    base_class: '/CustomSpace/Sockets/WebsocketProviderClient.js',

    setup: () => {
        return new Promise((resolve,reject)=>{
            $.ajax({
                url: customGlobalLoader.get_str_url(SocketLoader.providers),
                type: 'get',
                dataType: 'json',
                success: (d) => {
                    SocketLoader.providers = d;
                    resolve(customGlobalLoader.main.load_file({url:SocketLoader.base_class}));
                }
            })
        })
    },

    start: () => {
        SocketLoader.setup().then(()=>{
            let provider_paths = SocketLoader.providers.map(provider=>({url:provider.classPath}));
            Promise.all(customGlobalLoader.main.load_files({array:provider_paths})).then(()=>{
                //do something
            })
        })
    }
}

SocketLoader.start();