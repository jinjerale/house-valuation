import { ErrorHandler, dbCatch } from '../error'
import asyncHandler from 'express-async-handler'
import Score from '../../model/Score'
// import scoreTemplate from '../../model/scoreTemplate'

/**
 * @api {put} /score updateScore
 * @apiName UpdateScore
 * @apiGroup ScoreRule
 * @apiDescription 設定評分規則
 *
 * @apiparam {Object[]} myRules 規則的陣列
 * @apiparam {String} myRules.className 從template拿到的className
 * @apiparam {Number} myRules.param description中的X
 * @apiparam {Number} myRules.priority 優先度
 * 
 * @apiSuccess (204) -
 * 
 * @apiError (Server error 500) {Number} statusCode 500
 * @apiError (Server error 500) {String} msg 資料庫發生錯誤
 */
const updateScore = async (req,res,next)=>{
    await Score.deleteMany().catch(dbCatch)
    const {myRules} = req.body//[{className,param,priority}]
    await Score.insertMany(myRules).catch(dbCatch)
    res.end()
}

export default asyncHandler(updateScore)
import {body,checkSchema} from 'express-validator'
export const valid = [
    body('myRules').custom(value=>{
        if(!Array.isArray(value)) return false
        return value.every(({className,priority})=>className!==undefined && priority!==undefined)
    }).withMessage('input should be myRules:[{className,param(optional),priority}]')
]