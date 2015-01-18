using Backend.Models;
using Org.BouncyCastle.Cms;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.OpenSsl;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Backend.Controllers
{
    [EnableCors("*", "*", "*")]
    public class DecrypterController : ApiController
    {
        public IHttpActionResult Post(DecryptionRequest model)
        {
            var keyPair = FromPem(model.PrivateKey);
            return Json(new {
                PlainText = CMS.Decrypt(keyPair.Private, model.CipherText)
            });
        }

        private static AsymmetricCipherKeyPair FromPem(string pem)
        {
            using (var stringReader = new StringReader(pem))
            {
                var pemReader = new PemReader(stringReader);
                return (AsymmetricCipherKeyPair) pemReader.ReadObject();
            }
        }

        private static class CMS
        {
            internal static string Encrypt(AsymmetricKeyParameter publicKey, string value)
            {
                return
                    new Base64er().Encrypt(
                        new Coder().Encrypt(
                            new Crypter(publicKey).Encrypt(
                                new UTF8er().Encrypt(value))));
            }

            internal static string Decrypt(AsymmetricKeyParameter privateKey, string value)
            {
                return
                    new UTF8er().Decrypt(
                        new Crypter(privateKey).Decrypt(
                            new Coder().Decrypt(
                                new Base64er().Decrypt(value))));
            }

            private interface ICryptoPipeline<T1, T2>
            {
                T2 Encrypt(T1 value);
                T1 Decrypt(T2 value);
            }

            private class UTF8er : ICryptoPipeline<string, byte[]>
            {
                private static readonly Encoding Encoding = Encoding.UTF8;

                public byte[] Encrypt(string value)
                {
                    return Encoding.GetBytes(value);
                }

                public string Decrypt(byte[] value)
                {
                    return Encoding.GetString(value);
                }
            }

            private class Crypter : ICryptoPipeline<byte[], CmsEnvelopedData>
            {
                private static readonly byte[] SubjectKeyIdentifier = new byte[0];

                private readonly AsymmetricKeyParameter _key;

                internal Crypter(AsymmetricKeyParameter key)
                {
                    _key = key;
                }

                public CmsEnvelopedData Encrypt(byte[] value)
                {
                    var generator = new CmsEnvelopedDataGenerator();
                    generator.AddKeyTransRecipient(_key, SubjectKeyIdentifier);
                    return generator.Generate(new CmsProcessableByteArray(value), CmsEnvelopedGenerator.Aes256Cbc);
                }

                public byte[] Decrypt(CmsEnvelopedData value)
                {
                    var recipientID = new RecipientID { SubjectKeyIdentifier = SubjectKeyIdentifier };
                    return value.GetRecipientInfos().GetFirstRecipient(recipientID).GetContent(_key);
                }
            }

            private class Coder : ICryptoPipeline<CmsEnvelopedData, byte[]>
            {
                public byte[] Encrypt(CmsEnvelopedData value)
                {
                    return value.GetEncoded();
                }

                public CmsEnvelopedData Decrypt(byte[] value)
                {
                    return new CmsEnvelopedData(value);
                }
            }

            private class Base64er : ICryptoPipeline<byte[], string>
            {
                public string Encrypt(byte[] value)
                {
                    return Convert.ToBase64String(value);
                }

                public byte[] Decrypt(string value)
                {
                    return Convert.FromBase64String(value);
                }
            }
        }
    }
}
