import purchaseModel from "./models/Purchase.js";

const purchaseDao = {
  async createPurchase(purchaseData) {
    try {
      const newPurchase = new purchaseModel(purchaseData);
      return await newPurchase.save();
    } catch (error) {
      throw new Error(`Error al crear la compra: ${error.message}`);
    }
  },

  async getPurchaseById(purchaseId) {
    try {
      return await purchaseModel.findById(purchaseId);
    } catch (error) {
      throw new Error(`Error al obtener la compra por ID: ${error.message}`);
    }
  },

  async updatePurchase(purchase) {
    try {
      return await purchase.save();
    } catch (error) {
      throw new Error(`Error al actualizar la compra: ${error.message}`);
    }
  },

  async deletePurchase(purchaseId) {
    try {
      return await purchaseModel.findByIdAndDelete(purchaseId);
    } catch (error) {
      throw new Error(`Error al eliminar la compra: ${error.message}`);
    }
  },

};

export default purchaseDao;
