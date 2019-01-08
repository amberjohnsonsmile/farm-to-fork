const driver = require('bigchaindb-driver')
const bip39 = require('bip39')
require('dotenv').config()

class FarmToFork {
  constructor(keySeed) {
    this.connection = new driver.Connection(process.env.APP_URL, {
      app_id: process.env.APP_ID,
      app_key: process.env.APP_KEY
    })
    this.currentIdentity = this.generateKeypair("ftf")
  }

  generateKeyPair(keySeed) {
    if (typeof keySeed == "undefined" || keySeed == "") return new driver.Ed25519Keypair()
    return new driver.Ed25519Keypair(bip39.mnemonicToSeed(keySeed).slice(0, 32))
  }

  createAsset(foodItem) {

    return new Promise((resolve, reject) => {
      const assetData = {
        "type": "FtfTutorialAsset",
        "item": foodItem
      }

      const metaData = {
        "action": "Introduced",
        "data": new Date().toISOString()
      }

      const introduceFoodItemToMarketTransaction = driver.makeCreateTransaction(

        assetData,
        metData,
        [driver.Transaction.makeOutput(
          driver.Transacction.makeEd25519Condition(this.currentIdentity.publickKey))],
        this.currentIdentity.publicKey
      )

      const signedTransaction = driver.Transaction.signTransaction(introduceFoodItemToMarketTransaction, this.currentIdentity.privateKey)

      this.connection.postTransactionCommit(signedTransaction).then(postedTransaction => {
        resolve(postedTransaction)

      }).catch(err => {
        reject(new Error(err))
      })
    })
  }

  getAssets() {
    return new Promise((resolve, reject) => {
      this.connection.listOutputs(this.currentIdentity.publicKey, false).then(response => {
        resolve(response)
      }).catch(err => {
        reject(err)
      })
    })
  }

  updateAsset(transaction, action) {

    return new Promise((resolve, reject) => {
      console.log(transaction)
      const metaData = {
        "action": action,
        "date": new Date().toISOString()
      }

      const updateAssetTransaction = driver.Transaction.makeTransferTransaction(
        [{ tx: transaction, output_index: 0 }],
        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(this.currentIdentity.publicKey))],
        metaData
      )

      const signedTransaction = driver.Transaction.signTransaction(updateAssetTransaction, this.currentIdentity.privateKey)

      console.log("Posting transaction.")
      this.connection.postTransactionCommit(signedTransaction).then(postedTransaction => {
        resolve(postedTransaction)
      }).catch(err => {
        reject(err)
      })
    })
  }

  transferAsset(transaction, receiverPublicKey) {
    return new Promise((resolve, reject) => {
      const metaData = {
        "action" : "Transfer food-item to another firm.",
        "date" : new Date().toISOString()
      }
      const transferTransaction = driver.Transaction.makeTransferTransaction(
        [{ tx: transaction, output_index: 0}],
        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(receiverPublicKey))],
        metaData
      )
      const signedTransaction = driver.Transaction.signTransaction(transferTransaction, this.currentIdentity.privateKey)
      this.connection.postTransaction(signedTransaction).then( postedTransaction => {
        return this.connection.pollStatusAndFetchTransaction(postedTransaction.id)
      }).then( successfullyPostedTransaction => {
        resolve(successfullyPostedTransaction)
      }).catch( error => {
        reject(error)
      })
    })
  }

  getAllAssets() {
    return new Promise((resolve, reject) => {
      this.connection.searchAssets('FtfTutorialAsset').then( response => {
        resolve(response)
      })
    }).catch(error => {
      reject(error)
    })
  }
}

module.exports = {
  FarmToFork
}
