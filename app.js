//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connecting app to my databse
mongoose.connect('mongodb://localhost:27017/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

// creating schema
const itemsSchema = {
  name: String
};

// creating model from schema
const Item = mongoose.model("Item", itemsSchema); 

const item1 = new Item({
  name: "Welcome to your todolist."
});
const item2= new Item({
  name: "Hit the + button to add new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete item."
});
 
const defaultItems = [item1, item2, item3];

const listShema = {
  name: String,
  items: [itemsSchema]

};

const List = mongoose.model("List", listShema)

// inserting items in our database 
// Item.insertMany(defaultItems, function(err){
//     if(err){
//       console.log(err)
//     } else{
//       console.log("Successfully defaultItems into todolistDB")
//     }
//   });

  
    
app.get("/", function(req, res) {
  Item.find({} ,function(err, foundItems){
    if(foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err)
        } else{
          console.log("Successfully defaultItems into todolistDB")
        }
      });
      res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.get("/:customListName", (req, res)=>{
  const customListName = req.params.customListName;

  List.findOne({name : customListName}, (err, foundList)=>{
    if(!err){
      if(!foundList){
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName)
      } else{
        // Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items, customListName: customListName })
      }
    }

  })

  
});

app.post("/", function(req, res){
  let itemName = req.body.newItem;
  let listName = req.body.list;

  let item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/")
  } else{
    List.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)

    })
  }
  
  

});

app.post("/delete", function(req, res){
  console.log(req.body.checkbox)
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, (err) =>{
    if(!err){
      console.log("Item has been successfullly removed")
      res.redirect("/")
    }
  })
  
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
