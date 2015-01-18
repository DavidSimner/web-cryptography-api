define(['chai', 'chaiAsPromised'], function (chai, chaiAsPromised) {
    chai.use(chaiAsPromised);

    return chai.expect;
});