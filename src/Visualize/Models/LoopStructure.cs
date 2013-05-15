using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Models
{
    public class LoopStructure
    {
        public LoopStructure()
        {
            TreePages = new List<TreePage>();
            TreeNavigations = new List<TreeNavigationLink>();
        }

        public List<TreePage> TreePages { get; set; }
        public List<TreeNavigationLink> TreeNavigations { get; set; }
    }

    public class TreePage
    {
        public TreePage(string pageName, int pageID)
        {
            PageName = pageName;
            PageID = pageID;
        }

        public string PageName { get; set; }
        public int PageID { get; set; }
    }

    public class TreeNavigationLink
    {
        public TreeNavigationLink(int s, int t)
        {
            source = s;
            target = t;
            value = 1;
            type = "suit";
            style = string.Empty;
        }

        public int source { get; set; }
        public int target { get; set; }
        
        private TreeDisplayCondition _displayCondition;
        public TreeDisplayCondition DisplayCondition
        {
            get { return _displayCondition; }
            set
            {
                if (value != null)
                {
                    _displayCondition = value;
                    type = "resolved";
                }
            }
        }
        public int value { get; set; }
        public string type { get; set; }
        public string style { get; set; }
    }

    public class TreeDisplayCondition
    {
        public TreeDisplayCondition(string name, int ID, bool negate)
        {
            DisplayConditionName = name;
            DisplayConditionID = ID;
            NegateDisplayCondition = negate;
        }

        public bool NegateDisplayCondition { get; set; }
        public string DisplayConditionName { get; set; }
        public int DisplayConditionID { get; set; }
    }

}