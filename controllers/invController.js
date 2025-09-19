const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 * Build classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  const nav = await utilities.getNav();
  const className = data[0]?.classification_name || "Vehicles";
  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  });
};

/* ***************************
 * Build vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const invId = parseInt(req.params.invId);
  const vehicle = await invModel.getInventoryById(invId);
  const nav = await utilities.getNav();
  const html = utilities.buildDetailHTML(vehicle);
  res.render("inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    html,
  });
};

/* ***************************
 * Intentional error route
 * ************************** */
invCont.buildError = async function (req, res, next) {
  throw new Error("Intentional error for testing");
};

/* ***************************
 * Inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect,
  });
};

/* ***************************
 * Add classification view
 * ************************** */
invCont.buildAddView = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    nav,
    title: "Add New Classification",
    errors: null,
  });
};

/* ***************************
 * Add classification handler
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const nav = await utilities.getNav();
  const { classification_name } = req.body;
  const addResult = await invModel.addClassification(classification_name);

  if (addResult) {
    req.flash("notice-success", `You have added a new classification: ${classification_name}`);
    res.redirect("/inv");
  } else {
    req.flash("notice", "Adding classification failed.");
    res.render("./inventory/add-classification", {
      nav,
      title: "Add Classification",
      errors: null,
    });
  }
};

/* ***************************
 * Add inventory view
 * ************************** */
invCont.buildAddInv = async function (req, res, next) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    nav,
    title: "Add New Vehicle",
    classificationSelect,
    errors: null,
  });
};

/* ***************************
 * Add inventory handler
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const nav = await utilities.getNav();
  const {
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
  } = req.body;

  const vehicle = `${inv_year} ${inv_make} ${inv_model}`;
  const addResult = await invModel.addInventory(
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
  );

  const classificationSelect = await utilities.buildClassificationList(classification_id);

  if (addResult) {
    req.flash("notice-success", `${vehicle} has been added to the inventory`);
    res.redirect("/inv");
  } else {
    req.flash("notice", "Adding vehicle failed");
    res.status(501).render("./inventory/add-inventory", {
      nav,
      title: "Add New Vehicle",
      classificationSelect,
      errors: null,
    });
  }
};

/* ***************************
 * Get inventory as JSON
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData[0]?.inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 * Edit inventory view
 * ************************** */
invCont.editInvView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  const nav = await utilities.getNav();
  const invData = await invModel.getInventoryByInvId(inv_id);
  const vehicle = invData[0];
  const classificationSelect = await utilities.buildClassificationList(vehicle.classification_id);
  const vehicleName = `${vehicle.inv_make} ${vehicle.inv_model}`;

  res.render('./inventory/edit-inventory', {
    nav,
    title: `Edit ${vehicleName}`,
    errors: null,
    classificationSelect,
    ...vehicle
  });
};

/* ***************************
 * Update inventory handler
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav();
  const {
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id, inv_id
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id, inv_id
  );

  if (updateResult) {
    req.flash("notice-success", `${inv_year} ${inv_make} ${inv_model} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      nav,
      title: `Edit ${inv_make} ${inv_model}`,
      classificationSelect,
      errors: null,
      ...req.body
    });
  }
};

/* ***************************
 * Delete inventory view
 * ************************** */
invCont.deleteInvView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  const nav = await utilities.getNav();
  const invData = await invModel.getInventoryByInvId(inv_id);
  const vehicle = invData[0];
  const vehicleName = `${vehicle.inv_make} ${vehicle.inv_model}`;

  res.render('./inventory/delete-inventory', {
    nav,
    title: `Delete ${vehicleName}`,
    errors: null,
    ...vehicle
  });
};

/* ***************************
 * Delete inventory handler
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const nav = await utilities.getNav();
  const { inv_id, inv_make, inv_model } = req.body;
  const deleteResult = await invModel.deleteInventory(inv_id);

  if (deleteResult) {
    req.flash("notice-success", `${inv_make} ${inv_model} was deleted`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the delete failed.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
};

module.exports = invCont;
