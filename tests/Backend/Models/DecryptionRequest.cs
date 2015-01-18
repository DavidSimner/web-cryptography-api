using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Backend.Models
{
    public class DecryptionRequest
    {
        public string PrivateKey { get; set; }
        public string CipherText { get; set; }
    }
}
