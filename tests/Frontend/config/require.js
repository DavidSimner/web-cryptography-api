var require = {
    paths: {
        sut: '../..',

        asn1: 'Scripts/asn1',
        common: 'Scripts/common',
    },
    shim: {
        asn1: {
            deps: ['common'],
            exports: 'org.pkijs.asn1'
        }
    }
};