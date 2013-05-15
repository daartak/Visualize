using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Models
{
    public class ProductsStructure
    {
        public ProductsStructure()
        {
            children = new List<Product>();
            name = string.Empty;
            ID = 0;
        }

        public List<Product> children { get; set; }
        public string name { get; set; }
        public int ID { get; set; }
    }

    public class Product
    {
        public Product(string name, int id)
        {
            this.name = name;
            ID = id;
            children = new List<ProductLoop>();
        }

        public string name { get; set; }
        public int ID { get; set; }
        public List<ProductLoop> children { get; set; }
    }

    public class ProductLoop
    {
        public ProductLoop(string name, int id, int size)
        {
            this.name = name;
            ID = id;
            this.size = size;
        }

        public string name { get; set; }
        public int ID { get; set; }
        public int size { get; set; }
    }
}