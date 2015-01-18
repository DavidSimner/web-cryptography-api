var require = {
    paths: {
        sut: '../..',

        asn1: 'Scripts/asn1',
        chai: 'Scripts/chai',
        chaiAsPromised: 'Scripts/chai-as-promised',
        common: 'Scripts/common',
        expect: 'Scripts/expect',
        qwest: 'Scripts/qwest'
    },
    shim: {
        asn1: {
            deps: ['common'],
            exports: 'org.pkijs.asn1'
        }
    }
};