define(['asn1'], function (asn1) {
    function string2byteArray (string) {
        var byteArray = new Uint8Array(string.length);
        for (var i = 0; i < string.length; ++i) {
            byteArray[i] = string.charCodeAt(i);
        }
        return byteArray;
    }

    function byteArray2string (byteArray) {
        var string = '';
        for (var i = 0; i < byteArray.byteLength; ++i) {
            string += String.fromCharCode(byteArray[i]);
        }
        return string;
    }

    function arrayBuffer2string (arrayBuffer) {
        return byteArray2string(new Uint8Array(arrayBuffer));
    }

    function pem2ber (pem) {
        return string2byteArray(atob(pem));
    }

    function ber2pem (ber) {
        return btoa(arrayBuffer2string(ber));
    }


    // see: http://www.w3.org/TR/WebCryptoAPI/

    function generateKeyAsync () {
        return crypto.subtle.generateKey({ name: 'AES-CBC', length: 256 }, true, [ 'encrypt' ]);
    }

    function generateIvAsync () {
        return Promise.resolve(crypto.getRandomValues(new Uint8Array(16)));
    }

    function importKeyAsync (pem) {
        var ber = pem2ber(pem);
        return crypto.subtle.importKey('spki', ber, { name: 'RSA-OAEP', hash: { name: 'SHA-1' } }, false, [ 'wrapKey' ]);
    }

    function wrapKeyAsync (values) {
        var key = values[0];
        var wrappingKey = values[1];
        return crypto.subtle.wrapKey('raw', key, wrappingKey, { name: 'RSA-OAEP' });
    }

    function encryptAsync (values) {
        var key = values[0];
        var iv = values[1];
        var plainText = values[2];
        return crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, key, string2byteArray(plainText));
    }


    // TODO: move upstream: https://github.com/GlobalSign/ASN1.js/issues/9

    asn1.CONSTRUCTED_CONTEXT_SPECIFIC = function () {
        asn1.ASN1_CONSTRUCTED.call(this, arguments[0]);
        this.id_block.tag_class = 3;
        this.id_block.tag_number = 0;
    };
    asn1.CONSTRUCTED_CONTEXT_SPECIFIC.prototype = new asn1.ASN1_CONSTRUCTED();
    asn1.CONSTRUCTED_CONTEXT_SPECIFIC.constructor = asn1.CONSTRUCTED_CONTEXT_SPECIFIC;

    asn1.PRIMITIVE_CONTEXT_SPECIFIC = function () {
        asn1.ASN1_PRIMITIVE.call(this, arguments[0]);
        this.id_block.tag_class = 3;
        this.id_block.tag_number = 0;
    };
    asn1.PRIMITIVE_CONTEXT_SPECIFIC.prototype = new asn1.ASN1_PRIMITIVE();
    asn1.PRIMITIVE_CONTEXT_SPECIFIC.constructor = asn1.PRIMITIVE_CONTEXT_SPECIFIC;


    function createEnvelopedDataAsync (values) {
        var iv = values[0];
        var wrappedKey = values[1];
        var cipherText = values[2];
        return ber2pem(new asn1.SEQUENCE({
            value: [
                new asn1.OID({ value: '1.2.840.113549.1.7.3' }),
                new asn1.CONSTRUCTED_CONTEXT_SPECIFIC({
                    value: [
                        new asn1.SEQUENCE({
                            value: [
                                new asn1.INTEGER({ value: 2 }),
                                new asn1.SET({
                                    value: [
                                        new asn1.SEQUENCE({
                                            value: [
                                                new asn1.INTEGER({ value: 2 }),
                                                new asn1.PRIMITIVE_CONTEXT_SPECIFIC(),
                                                new asn1.SEQUENCE({
                                                    value: [
                                                        new asn1.OID({ value: '1.2.840.113549.1.1.7' }),
                                                        new asn1.NULL()
                                                    ]
                                                }),
                                                new asn1.OCTETSTRING({ value_hex: wrappedKey })
                                            ]
                                        })
                                    ]
                                }),
                                new asn1.SEQUENCE({
                                    value: [
                                        new asn1.OID({ value: '1.2.840.113549.1.7.1' }),
                                        new asn1.SEQUENCE({
                                            value: [
                                                new asn1.OID({ value: '2.16.840.1.101.3.4.1.42' }),
                                                new asn1.OCTETSTRING({ value_hex: iv })
                                            ]
                                        }),
                                        new asn1.CONSTRUCTED_CONTEXT_SPECIFIC({
                                            value: [
                                                new asn1.OCTETSTRING({ value_hex: cipherText })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        }).toBER(false));
    }


    function Cms() {
    }

    Cms.prototype.encrypt = function (publicKey, plainText) {
        var publicKeyPromise = Promise.resolve(publicKey);
        var plainTextPromise = Promise.resolve(plainText);

        var generateKeyPromise = generateKeyAsync();
        var generateIvPromise = generateIvAsync();
        var importKeyPromise = publicKeyPromise.then(importKeyAsync);
        var wrapKeyPromise = Promise.all([ generateKeyPromise, importKeyPromise ]).then(wrapKeyAsync);
        var encryptPromise = Promise.all([ generateKeyPromise, generateIvPromise, plainTextPromise ]).then(encryptAsync);
        var createEnvelopedDataPromise = Promise.all([ generateIvPromise, wrapKeyPromise, encryptPromise ]).then(createEnvelopedDataAsync);

        return createEnvelopedDataPromise;
    };

    return Cms;
});