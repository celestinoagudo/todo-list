//required modules
const express = require('express');
const date = require(`${__dirname}/date.js`);
const messageUtils = require(`${__dirname}/messages-utils.js`);
const mongoose = require('mongoose');

//module constants
const _ = require('lodash');
const templateName = "list"

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({
    extended: true
}));

//setting standard folder for serving static files
app.use(express.static("public"));

const connectionString = `mongodb+srv://admin-celestino:mong0DBcelestin0asaDM@cluster0.34ugi.mongodb.net/todoListDB`;

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

//todo item schema
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "No todo item name specified"]
    }
});

//custom list of todo items
const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "No list name specified"]
    },
    items: [itemSchema],
});

//creating model
const TodoItem = mongoose.model("Item", itemSchema);

const ItemList = mongoose.model("ItemList", listSchema);

app.get("/", (request, response) => {

    TodoItem.find((error, todoItems) => {
        if (error) {
            messageUtils.logFetchDataError(error);
            response.redirect("/")
        } else {
            response.render(templateName, {
                listTitle: date.getDay(),
                newListItems: todoItems
            });
        }
    });

});

app.get("/:category", (request, response) => {

    const categoryName = _.capitalize(request.params.category);
    const itemList = ItemList({
        name: categoryName,
        items: [],
    });

    ItemList.findOne({
        name: itemList.name
    }, (searchError, matchedItem) => {
        if (searchError) {
            messageUtils.logSearchError(itemList.name, searchError);
        } else {
            if (!matchedItem) {
                itemList.save().then((newItemSaved) => {
                    messageUtils.logUpdateSuccess(newItemSaved.name);

                    response.render(templateName, {
                        listTitle: newItemSaved.name,
                        newListItems: newItemSaved.items,
                    });
                }).catch((saveError) => {
                    messageUtils.logUpdateError(matchedItem.name, saveError);
                    mongoose.connection.close();

                });
            } else {
                messageUtils.logDocumentAlreadyExists(matchedItem.name);

                response.render(templateName, {
                    listTitle: matchedItem.name,
                    newListItems: matchedItem.items,
                });
            }
        }
    })
});

app.post("/", (request, response) => {
    let itemName = request.body.nextItem;

    const item = TodoItem({
        name: itemName
    });

    const listName = request.body.list;

    if (listName !== date.getDay()) {
        ItemList.findOne({
            name: listName
        }, (searchError, matchedItem) => {
            if (searchError) {
                messageUtils.logSearchError(listName, searchError);

            } else if (matchedItem) {
                if (item.name && !isItemAlreadyInTheList(matchedItem.items, item)) {
                    matchedItem.items.push(item);
                } else {
                    messageUtils.logDocumentAlreadyExist(item.name);
                }

                ItemList.findOneAndUpdate({
                    _id: matchedItem._id
                }, {
                    items: matchedItem.items
                }, (saveError, newItemSaved) => {
                    if (saveError) {
                        messageUtils.logUpdateError(matchedItem.name, saveError);

                    } else if (newItemSaved) {

                        messageUtils.logUpdateSuccess(newItemSaved.name);

                    }
                    response.redirect(`/${listName}`);
                })
            }

        });
    } else {

        TodoItem.findOne({
            name: item.name
        }, (searchError, matchedItem) => {
            if (searchError) {
                messageUtils.logSearchError(item.name, searchError);
            } else {
                if (!matchedItem) {
                    item.save().then((newItem) => {

                        messageUtils.logInsertSuccess(newItem.name);

                    }).catch((saveError) => {
                        messageUtils.logInsertErrorMessage(getValidationErrorMessage(saveError));
                    })

                } else {

                    messageUtils.logDocumentAlreadyExist(item.name);
                }
            }
            response.redirect("/");

        });
    }
});

app.post("/delete", (request, response) => {

    const deletedItemId = request.body.deletedItem;
    const sourceList = request.body.listName.trim();

    if (_.lowerCase(sourceList) !== _.lowerCase(date.getDay())) {
        ItemList.findOne({
            name: sourceList
        }, (searchError, matchedItem) => {
            if (searchError) {
                messageUtils.logSearchError(sourceList, searchError);
            } else if (matchedItem) {
                let updatedItemList = [];
                matchedItem.items.forEach((item) => {
                    if (!item._id.equals(deletedItemId)) {
                        updatedItemList.push(item);
                    }
                });

                ItemList.updateOne({
                    name: sourceList
                }, {
                    items: updatedItemList
                }, (saveError, updatedDocument) => {
                    if (saveError) {
                        messageUtils.logUpdateError(sourceList, saveError);

                    } else if (updatedDocument) {

                        messageUtils.logUpdateSuccess(sourceList);
                    }
                    response.redirect(`/${sourceList}`);
                });

            }
        });
    } else {
        TodoItem.findByIdAndRemove({
            _id: deletedItemId
        }, (error, deletedItem) => {
            if (error) {
                messageUtils.logDeleteError(deletedItemId, deletedItem.name);
            } else {

                messageUtils.logDeleteSuccess(deletedItemId, deletedItem.name)
            }
            response.redirect("/");
        });
    }

})

/**
 * utility method to get the exact error message from the passed error reference
 * @param {*} validationError reference to error message object
 * @returns exact error message set to passed error message reference.
 */
function getValidationErrorMessage(validationError) {
    let validationErrorMessage = "";
    if (validationError.name == 'ValidationError') {
        for (field in validationError.errors) {
            console.log(field);
            validationErrorMessage += (validationError.errors[field].message);
        }
    }
    return validationErrorMessage;
}

/**
 * utility method to check whether the item is already in the items
 * @param {*} items list of items
 * @param {*} item item to be added
 * @returns true or false 
 */
function isItemAlreadyInTheList(items, item) {
    for (index in items) {
        if (_.lowerCase(item.name) === _.lowerCase(items[index].name)) {
            return true;
        }
    }
    return false;
}

app.listen(process.env.PORT || 3000, function () {
    console.log("Server is up and running ...");
});