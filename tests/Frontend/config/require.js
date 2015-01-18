var require = {
    paths: {
        sut: '../..',

        ajax: 'Scripts/ajax',
        asn1: 'Scripts/asn1',
        chai: 'Scripts/chai',
        chaiAsPromised: 'Scripts/chai-as-promised',
        common: 'Scripts/common',
        expect: 'Scripts/expect'
    },
    shim: {
        asn1: {
            deps: ['common'],
            exports: 'org.pkijs.asn1'
        }
    }
};