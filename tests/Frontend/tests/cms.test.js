define(['expect', 'ajax', 'sut/cms'], function (expect, Ajax, Cms) {
    describe('Cms', function () {
        this.timeout(16000);

        describe('encrypt', function () {
            describe('interoperability with BouncyCastle.Crypto', function () {
                function doTest (value, done) {
                    var arrange = new Ajax('http://localhost:64189/api/keyGenerator').get();

                    var act = arrange.then(function (arrangement) {
                        return new Cms().encrypt(arrangement.PublicKey, value);
                    });

                    var assert = Promise.all([ arrange, act ]).then(function (values) {
                        var arrangement = values[0];
                        var result = values[1];
                        return new Ajax('http://localhost:64189/api/decrypter').post({ PrivateKey: arrangement.PrivateKey, CipherText: result }).then(function (response) {
                            return response.PlainText;
                        });
                    });

                    expect(assert).eventually.equal(value).and.notify(done);
                }

                it('Hello World', function (done) {
                    doTest('Hello World', done);
                });
            });
        });
    });
});