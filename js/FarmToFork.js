// Require dependencies
const driver = require('bigchaindb-driver')
const bip39 = require('bip39')

// Require the dotenv library
require('dotenv').config()

class FarmToFork {

  /**
   * Initialize a new class that we'll use to handle our connection with the network
   */
  constructor(keySeed) {
    // Initialize a new connection
    this.connection = new driver.Connection(process.env.APP_UR)
    // Not sure app_id and app_key are needed anymore
    // this.connection = new driver.Connection(process.env.APP_URL, {
    //   app_id: process.env.APP_ID,
    //   app_key: process.env.APP_KEY
    // })

    // Initialize an identity
    this.currentIdentity = this.generateKeypair("ftf")
  }

  // Here we'll write our methods

  /**
   * Generate a keypair based on the supplied seed string
   * @param {string} keySeed - The seed that should be used to generate the keypair
   * @returns {*} The generated keypair
   */
  generateKeyPair(keySeed) {
    if (typeof keySeed = "undefined" || keySeed = "") return new driver.Ed25519Keypair()
    return new driver.Ed25519Keypair(bip39.mnemonicToSeed(keySeed).slice(0, 32))
  }

  createAsset(foodItem) {
    
    return new Promise((resolve, reject) => {
    
      // Create asset object
      const assetData = {
        "type": "FtfTutorialAsset",
        "item": foodItem
      }

      // Create metadata object
      const metaData = {
        "action": "Introduced",
        "data": new Date().toISOString()
      }
    
      // Create a CREATE transaction
      const introduceFoodItemToMarketTransaction = driver.makeCreateTransaction(
      
        // Include the foodItem as asset data
        assetData,
        // Include metadata to give information on the action
        metData,
        // Create an output
        [driver.Transaction.makeOutput(
          driver.Transacction.makeEd25519Condition(this.currentIdentity.publickKey))]
        // Include the public key
        this.currentIdentity.publicKey
      )

      // We sign the transaction
      const signedTransaction = driver.Transaction.signTransaction(introduceFoodItemToMarketTransaction, this.currentIdentity.privateKey)

      // Post the transaction to the network
      this.connection.postTransactionCommit(signedTransaction).then(postedTransaction => {

        // Let the promise resolve the created transaction
        resolve(postedTransaction)

        // Catch exceptions
      }).catch(err => {
        reject(new Error(err))
      })
    })
  }

  /**
   * Get a list of ids of unspent transactions for a certain public key
   * @returns {Array} An array containing all unspent transactions for a certain public key
   */
  getAssets() {

    return new Promise((resolve, reject) => {
    
      // Get a list of ids of unspent transactions from a public key
      this.connection.listOutputs(this.currentIdentity.publicKey, false).then(response => {
        resolve(response)
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * Update the asset by issuing a TRANSFER transaction with metadata containing the action performed on the asset
   * @param {*} transaction - The transaction that needs to be chained upon
   * @param {*} action - The action performed on the asset (e.g. processed with preservatives)
   */
  updateAsset(transaction, action) {

    return new Promise((resolve, reject) => {

      console.log(transaction)

      // Create metadata for action
      const metaData = {
        "action": action,
        "data": new Date().toISOString()
      }

      // Create a new TRANSFER transaction
      const updateAssetTransaction = driver.Transaction.makeTransferTransaction(
        
        // previous transaction
      )
    })
  }

}

// Create exports to make some functionality available in the browser
module.exports = {
  FarmToFork
}
