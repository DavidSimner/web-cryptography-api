define(['expect', 'qwest', 'sut/cms'], function (expect, qwest, Cms) {
    describe('Cms', function () {
        this.timeout(32000);

        describe('encrypt', function () {
            describe('interoperability with BouncyCastle.Crypto', function () {
                it('Hello World', function (done) {
                    qwest.get('http://localhost:64189/api/keyGenerator/get', {}, { timeout: 8000, responseType: 'json' }).then(function (response) {
                        expect(new Cms().encrypt(response.PublicKey, 'Hello World')).to.be.fulfilled.and.notify(done);
                    });
                });
            });
        });
    });
});