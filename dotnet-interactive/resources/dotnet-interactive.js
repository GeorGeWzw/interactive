﻿define({
    init: function (global) {
        global.createDotnetInteractiveClient = async (address) => {
            let rootUrl = address;
            if (!address.endsWith("/")) {
                rootUrl = `${rootUrl}/`;
            }

            async function clientFetch(url, init) {
                let address = url;
                if (!address.startsWith("http")) {
                    address = `${rootUrl}${url}`;
                }
                let response = await fetch(address, init);
                return response;
            }

            let client = {};

            client.fetch = clientFetch;

            client.getVariable = async (kernel, variable) => {
                let response = await clientFetch(`variables/${kernel}/${variable}`);
                let variableValue = await response.json();
                return variableValue;
            };

            client.getResource = async (resource) => {
                let response = await clientFetch(`resources/${resource}`);
                return response;
            };

            client.getResourceUrl = (resource) => {
                let resourceUrl = `${rootUrl}resources/${resource}`;
                return resourceUrl;
            };

            client.loadKernels = async () => {
                let kernels = await clientFetch("kernels");
                let kernelNames = await kernels.json();
                if (Array.isArray(kernelNames)) {
                    for (let i = 0; i < kernelNames.length; i++) {
                        let kernelName = kernelNames[i];
                        client[kernelName] = {
                            getVariable: (variableName) => {
                                return client.getVariable(kernelName, variableName);
                            }
                        };
                    }
                }
            };

            await client.loadKernels();

            return client;
        };
    }
});