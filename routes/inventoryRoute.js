const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

console.log("Controller keys:", Object.keys(invController));
console.log("utilities keys:", Object.keys(utilities));

// Classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Vehicle detail view (Assignment 3)
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetailView));

// Intentional error route
router.get("/error", utilities.handleErrors(invController.buildError));

// Inventory management
router.get("/", utilities.checkLogin, utilities.checkAuthZ, utilities.handleErrors(invController.buildManagement));

// Add classification view
router.get("/add-classification", utilities.checkLogin, utilities.checkAuthZ, utilities.handleErrors(invController.buildAddView));

// Add inventory view
router.get("/add-inventory", utilities.checkLogin, utilities.checkAuthZ, utilities.handleErrors(invController.buildAddInv));

// Inventory JSON for AJAX
router.get("/getInventory/:classification_id", utilities.checkLogin, utilities.checkAuthZ, utilities.handleErrors(invController.getInventoryJSON));

// Edit inventory view
router.get("/edit/:inv_id", utilities.checkLogin, utilities.checkAuthZ, utilities.handleErrors(invController.editInvView));

// Delete inventory view
router.get("/delete/:inv_id", utilities.checkLogin, utilities.checkAuthZ, utilities.handleErrors(invController.deleteInvView));

// Process add classification
router.post("/add-classification", invValidate.classificationRules(), invValidate.checkClassificationName, utilities.handleErrors(invController.addClassification));

// Process add inventory
router.post("/add-inventory", invValidate.invRules(), invValidate.checkInventoryData, utilities.handleErrors(invController.addInventory));

// Process update inventory
router.post("/update/", invValidate.invRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory));

// Process delete inventory
router.post("/delete/", utilities.handleErrors(invController.deleteInventory));

module.exports = router;
