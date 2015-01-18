define(['expect', 'ajax', 'sut/cms'], function (expect, Ajax, Cms) {
    describe('Cms', function () {
        this.timeout(32000);

        describe('encrypt', function () {
            describe('interoperability with BouncyCastle.Crypto', function () {
                function doTest (value, done) {
                    new Ajax('http://localhost:64189/api/keyGenerator').get().then(function (response) {
                        expect(new Cms().encrypt(response.PublicKey, value)).to.be.fulfilled.and.notify(done);
                    });
                };

                it('Hello World', function (done) {
                    doTest('Hello World', done);
                });
            });
        });
    });
});