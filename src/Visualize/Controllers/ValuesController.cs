using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Models;

namespace Visualize.Controllers
{
    public class ValuesController : ApiController
    {
        // GET api/values
        public ProductsStructure Get()
        {
            var obj = new ProductsStructure()
            {
                ID = 0,
                name = "",
                children = new List<Product>() 
                { 
                    new Product("Car sales", 1) { children = new List<ProductLoop>() {
                            new ProductLoop("Sales journey", 100, 10),
                            new ProductLoop("Edit journey", 200, 20),
                            new ProductLoop("Claim journey", 300, 5)
                        } 
                    },
                    new Product("Travel sales", 2) { children = new List<ProductLoop>() {
                            new ProductLoop("Sales journey", 400, 10),
                            new ProductLoop("Edit journey", 500, 20),
                            new ProductLoop("Claim journey", 600, 5)
                        } 
                    },
                    new Product("Registration", 3) { children = new List<ProductLoop>() {
                            new ProductLoop("Register customer", 10, 5),
                            new ProductLoop("Password recovery", 20, 5)
                        } 
                    }
                }
            };
            
            return obj;
        }

        // GET api/values/5
        public LoopStructure Get(int id)
        {
            return new LoopStructure
            {
                TreeNavigations = new List<TreeNavigationLink>
                {
                    new TreeNavigationLink(0, 1)
                },
                TreePages = new List<TreePage>
                {
                    new TreePage("a", 1),
                    new TreePage("b", 2)
                }
            };
        }

        // POST api/values
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }
    }
}