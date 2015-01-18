define(['expect', 'qwest', 'sut/cms'], function (expect, qwest, Cms) {
    describe('Cms', function () {
        this.timeout(32000);

        describe('encrypt', function () {
            describe('interoperability with BouncyCastle.Crypto', function () {
                function doTest (value, done) {
                    qwest.get('http://localhost:64189/api/keyGenerator', {}, { timeout: 10000, responseType: 'json' }).then(function (response) {
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