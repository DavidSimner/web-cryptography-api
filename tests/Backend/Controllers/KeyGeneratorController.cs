using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Security;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Backend.Controllers
{
    public class KeyGeneratorController : ApiController
    {
        private const int BitLength = 2048;

        public IHttpActionResult Get()
        {
            var keyPair = GenerateBouncyCastleKeyPair();
            return Json(new {
                PublicKey = ToPem(keyPair.Public),
                PrivateKey = ToPem(keyPair.Private),
            });
        }

        private static AsymmetricCipherKeyPair GenerateBouncyCastleKeyPair()
        {
            var keyPairGenerator = new RsaKeyPairGenerator();
            keyPairGenerator.Init(new KeyGenerationParameters(new SecureRandom(), BitLength));
            return keyPairGenerator.GenerateKeyPair();
        }

        private static string ToPem(AsymmetricKeyParameter key)
        {
            using (var stringWriter = new StringWriter())
            {
                var pemWriter = new PemWriter(stringWriter);
                pemWriter.WriteObject(key);
                return stringWriter.ToString();
            }
        }
    }
}
