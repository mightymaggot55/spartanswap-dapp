import { Container } from '../layout/theme/components'
import SVGArrowDown from '../../assets/svg/SVGArrowDown'
import React, { useState, useEffect, useContext } from 'react'
import { Context } from '../../context'

import { SPARTA_ADDR, BNB_ADDR, getSpartaContract, getTokenContract, getTokenDetails, getTokenData, getPoolsData, getListedTokens, getListedPools, ROUTER_ADDR } from '../../client/web3'
import { message, Input } from 'antd';
import { bn, formatBN, convertFromWei, convertToWei, formatUSD } from '../../utils'
import { getSwapOutput, getSwapSlip } from '../../math'
import { Center } from '../components/elements';



//const { TabPane } = Tabs;
var utils = require('ethers').utils;

const SimpleSwap = (props) => {

    const context = useContext(Context)

    const [recipientError, setRecipientError] = useState(false)
    const [isError, setIsError] = useState(false)
    const [inputAmount, setinputAmount] = useState(0)
    const [tokenFrom, setAssetFrom] = useState(SPARTA_ADDR);
    const [tokenTo, setAssetTo] = useState('0x0000000000000000000000000000000000000000');
    const [approval, setApproval] = useState(false)

    const [inputTokenData, setTokenData] = useState({
        'symbol': 'SPARTA',
        'name': 'SPARTAN PROTOCOL TOKEN',
        'balance': 0,
        'address': SPARTA_ADDR
    })

    const [outputTokenData, setOutTokenData] = useState({
        'symbol': '',
        'name': '',
        'balance': 0,
        'address': ''
    })



    const [buyData, setBuyData] = useState({
        address: SPARTA_ADDR,
        balance: 0,
        input: 0,
        symbol: "XXX",
        output: 0,
        outputSymbol: "XXX",
        slip: 0
    })
    const [sellData, setsellData] = useState({
        address: SPARTA_ADDR,
        balance: 0,
        input: 0,
        symbol: "XXX",
        output: 0,
        outputSymbol: "XXX",
        slip: 0
    })

    const [startTx, setStartTx] = useState(false);
    const [endTx, setEndTx] = useState(false);

    useEffect(() => {
        if (context.connected) {
            getData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context.connected])



    const getData = async () => {
        let tokenDetails = await getTokenData(tokenFrom, context.walletData)
        setTokenData(tokenDetails)
        let poolsData = context.poolsData ? context.poolsData : await getPoolsData(tokenArray)
        context.setContext({ 'poolsData': poolsData })
        let poolArray = await getListedPools()
        context.setContext({ 'poolArray': poolArray })
        let tokenArray = context.tokenArray ? context.tokenArray : await getListedTokens()
        context.setContext({ 'tokenArray': tokenArray })
        setBuyData(await getSwapData(inputTokenData.balance, inputTokenData, outputTokenData, poolsData))
        //setSellData(await getSwapData(outputTokenData.balance, outputTokenData, inputTokenData, poolsData)) --- sparta cannot be brought
    }


    const getSwapData = async (input, inputTokenData, outputTokenData, poolData) => {

        var output; var slip
        output = getSwapOutput(input, poolData, false)
        slip = getSwapSlip(input, poolData, false)
        console.log(formatBN(output), formatBN(slip))

        const swapData = {
            address: poolData.address,
            balance: inputTokenData.balance,
            input: formatBN(bn(input), 0),
            inputSymbol: inputTokenData.symbol,
            output: formatBN(output, 0),
            outputSymbol: outputTokenData.symbol,
            slip: formatBN(slip)
        }
        console.log(swapData)
        return swapData
    }

    const approve = async () => {

        const contract = getTokenContract(inputTokenData.address)
        // (utils.parseEther(10**18)).toString()
        const supply = await contract.methods.totalSupply().call()
        await contract.methods.approve(ROUTER_ADDR, supply).send({ from: context.walletData.address, gasPrice: '', gas: '' })
        //message.success(`Transaction Sent!`, 2);       
    }

    const swap = async () => {
        setStartTx(true)
        let contract = getSpartaContract()
        //await contract.methods.upgrade(tokenTo).send({ from: context.walletData.address, gasPrice: '', gas: '' })
        await contract.methods.upgrade(buyData.input, context.poolsData.address).send({ from: context.walletData.address, gasPrice: '', gas: '' })

        //message.success(`Transaction Sent!`, 2);
        setStartTx(false)
        setEndTx(true)
        context.setContext({ 'tokenDetailsArray': await getTokenDetails(context.walletData.address, context.tokenArray) })
    }

    const checkApproval = async (address) => {
        const contract = getTokenContract(address)
        const approval = await contract.methods.allowance(context.walletData.address, ROUTER_ADDR).call()
        console.log(approval)
        if (+approval > 0) {
            setApproval(true)
            console.log(approval)
        }
    }

    const inputTokenAmount = async (e) => {
        setinputAmount(e.target.value)
    }

    const changeToken = async (e) => {
        setAssetFrom(e.target.value)
        setApproval(false)
        checkApproval(tokenFrom)
        let tokenDetails = await getTokenData(tokenFrom, context.walletData)
        setTokenData(tokenDetails)
        //getSwapData calls pools
        //setBuyData(await getSwapData(inputAmount, inputTokenData, outputTokenData, context.poolsData))

    }

    const changeOutputToken = async (e) => {

        setAssetTo(e.target.value)
        setApproval(false)
        checkApproval(tokenTo)
        let tokenDetails = await getTokenData(tokenTo, context.walletData)
        setOutTokenData(tokenDetails)
        //getSwapData calls pools

    }

    const swapFunction = async (address) => {

        setStartTx(true)
        let contract = getTokenContract(address)
        await contract.methods.upgrade(buyData.input, context.poolsData.address).send({ from: context.walletData.address, gasPrice: '', gas: '' })
        setStartTx(false)
        setEndTx(true)
        context.setContext({ 'tokenDetailsArray': await getTokenDetails(context.walletData.address, context.tokenArray) })

        //else if (address == BNB_ADDR) {
        //    let contract = getTokenContract(address)
        //    await contract.methods.upgrade(buyData.input, context.poolsData.address).send({ from: context.walletData.address, gasPrice: '', gas: '' })
        //    setStartTx(false)
        //    setEndTx(true)
        //    context.setContext({ 'tokenDetailsArray': await getTokenDetails(context.walletData.address, context.tokenArray) })
        //}
    }

    const Image = () => {
        return (
            <div>
                <br /><br /><br />
                <Center>
                    <img src='favicon.png' />
                    <br /><br />
                </Center>
                <div class='centerObject2'>
                    <h1>Swap</h1>
                </div>
            </div>

        )
    }

    return (
        <div>
            <Image />
            <div class='outerContainer'>
                <Container>
                    <div class='container2'>
                        <div class='centerObject2'>
                            <Container>
                                <h2>Input</h2><Input onChange={changeToken} placeholder={'Enter BEP2E Asset Address'}></Input>
                                < br />< br />
                                <Input placeholder={'0.0'} onChange={inputTokenAmount} ></Input>
                                <h4>&nbsp; Balance: {utils.formatEther(inputTokenData?.balance, { commify: true })}&nbsp; {inputTokenData.symbol}</h4>
                            </Container>
                        </div>
                    </div>
                    <div class='arrow'>
                        <SVGArrowDown />
                    </div>

                    <br />
                    <div class='container2'>
                        <Container>
                            <div class='centerObject2'>
                                <h2>Output</h2>
                                <Input placeholder={'Enter BEP2E Asset Address'} onChange={changeOutputToken}></Input>
                                < br />< br />
                                <h4>&nbsp; Output: {/*utils.formatEther(buyData.output, { commify: true })*/} {outputTokenData.symbol} </h4>
                            </div>
                        </Container>
                    </div>
                    <h4>&nbsp; Slippage: {/*swapData.slip*/}%</h4>

                </Container>
                <br /><br />
                <div class='centerObject2'>
                    {!context.connected &&
                        <p> Please Wait for Metamask to connect</p>}
                    {
                        !approval && context.connected &&
                        <button1 onClick={approve}>APPROVE</button1>
                    }
                    {
                        approval && !startTx &&
                        <button1 onClick={swap}>UPGRADE</button1>
                    }
                    {
                        approval && startTx && !endTx &&
                        <button1 onClick={swap}>UPGRADE</button1>
                    }
                </div>
            </div>
            <br /><br /><br /><br /><br />
        </div>
    )
    }

export default SimpleSwap




//const SwapTo = async () => {
    //    setApproval(false)
    //    checkApproval(tokenFrom)
    //    if (approval) {
    //        setStartTx(true)
    //        let contract = getSpartaContract()
    //        await contract.methods.upgrade(tokenTo).send({ from: context.walletData.address, gasPrice: '', gas: '' })
    //        setStartTx(false)
    //        setEndTx(true)
    //        context.setContext({ 'tokenDetailsArray': await getTokenDetails(context.walletData.address, context.tokenArray) })
    //    }
    //    else {
    //        setIsError(true)
    //        setRecipientError("There was a error approving the address account")
    //    }
    //}