import {  Avatar, Popover, Divider } from 'antd';
import {EnvironmentFilled} from '@ant-design/icons';
import BuildingType from '../axios/buildingType';
import {useEffect, useState} from 'react'
import './House_Pin.css';
import QueryForm from './House_Query';
import { priceConvert, timeConvert } from '../util/util';
import { SetManualPriceForm } from './House_Valuate';
import UpdateQueryForm from './Update_Query'
import { deleteValuate } from '../axios/axios';

const House_Pin = ({id,buildingType,click,unitPrice,hover,getDetail}) => {
    const [visible, setvisible] = useState(false); // control Popover
    const title = (
        <span>House Info</span>
    );
    const content = (
        <>
        <p>類型: {BuildingType[buildingType]}</p>
        <p>單位房價: NT${priceConvert(unitPrice)} /坪</p>
        <a onClick={async()=>{
            await setvisible(false);
            // console.log("in func",id);
            getDetail(id);
        }}>more details</a>
        </>
    );
    const iconStyle = {
        position: 'absolute',
        bottom: '0',
        left: '-8pt',
        fontSize: '16pt',
        color: '#08c'
    };
    const iconStyleHover = {
        ...iconStyle,
        left: '-10pt',
        fontSize: '20pt',
        color: '#0ac'
    };
    const handleVisible = (v) => {
        setvisible(v);
    }

    let style = (hover || visible)? iconStyleHover: iconStyle;

    return (
        <div className="house-pin">
        <Popover 
            placement='right' 
            title={title} 
            content={content}
            trigger="click" 
            visible={click && visible}
            onVisibleChange={handleVisible}
        >    
            <EnvironmentFilled style={style}/>
        </Popover>
        </div>
    );
}

const House_Cluster = ({sum, size, pointSize, hover, click, ...props }) => {
    const [points, setPoints] = useState([]);
    const overflowCount = (size) => (size <= 99)? String(size): "99+";

    const handleClick = () => {
        const leaves = props.getLeaves(props.id);
        // console.log(leaves);
        if (leaves){
            setPoints(leaves);
        }
    }

    let ratio = (hover)? 8:0;
    let markSize = ratio + 40 - Math.round(40/size);
    const content = (
        <div className="cluster">
            <p>平均房價: NT${priceConvert(Math.round(sum/size))} /坪</p>
            {(points && points.length > 0)
                ?<p>類型: {BuildingType[points[0].buildingType]}</p>
                :<a onClick={handleClick}>get more</a>
            }
            {(points && points.length > 0)
                ?points.map((l,ind) => (
                    <>
                        <Divider plain>house {ind+1}</Divider>
                        <p>每坪房價: NT${priceConvert(l.unitPrice)}</p>
                        <a onClick={async()=>{
                            // await setvisible(false);
                            props.getDetail(l.id);
                        }}>more details</a>                    
                    </>
                ))
                :<></>
            }
        </div>
    )
    return (
        <Popover 
            placement='right'
            title={`Cluster with ${size} houses`}
            visible={click}
            content={content}
            trigger="click"
        >
            <Avatar 
                style={{ 
                    backgroundColor: '#0b9',
                    cursor: 'pointer',
                    fontSize: `${(hover? "16":"14")}px`,
                    position: 'absolute',
                    bottom: `-${markSize/2}px`,
                    left: `-${markSize/2}px`
                }}
                size={markSize}
            >{overflowCount(size)}</Avatar>
        </Popover>
        
    )
}

const Current_Pin = ({hover, showForm, click, lat, lng, moveCen, handleAddHouses, showNewHouse})=>{
    const myStyle = {
        position: 'absolute',
        bottom: '0',
        left: '-9pt',
        fontSize: '18pt',
        color: '#f80'
    };
    const myStyleHover = {
        ...myStyle,
        left: '-10pt',
        fontSize: '20pt'
    }
    let style = (hover)?  myStyleHover: myStyle;

    const content = (
        <div>
            <QueryForm 
                name="Inquire house price" 
                showForm={showForm} 
                lat={lat} 
                lng={lng}
                moveCen={moveCen}
                handleAddHouses={handleAddHouses}
                showNewHouse={showNewHouse}
            />
        </div>
    );
    return(
        <div className="house-pin">
        <Popover 
            placement='right'
            title="New Mark"
            trigger="click"
            visible={click}
            content={content}
            
        >
            <EnvironmentFilled style={style}/>
        </Popover>
        </div>
    );
}

// ====== the pin for user when it complete the query
const House_Eval_Pin = (props) => {
    // processed or not
    // admin or not
    const myStyle = {
        position: 'absolute',
        bottom: '0',
        left: '-9pt',
        fontSize: '18pt',
        color: (props.auth)
            ? ((props.processed)?'#945':'#fd0')
            : ((props.processed)?'#94c':'#8d0')
    };
    const myStyleHover = {
        ...myStyle,
        left: '-10pt',
        fontSize: '20pt'
    }
    const setPrice = (p) => {
        const price = Math.round(p);
        props.setManualPrice({_id:props.id, manualPrice:price});
    }
    
    const deleteHouseQuery = async() => {
        await deleteValuate(props.id)
        props.getMyHouses()
    }
    const authFunction = (props.auth)
        ?
        <SetManualPriceForm 
            setPrice={setPrice}
        >Set manual price</SetManualPriceForm>
        : <div className="eval-pin">
            <a onClick={props.showSim}>View similar houses</a>
            <UpdateQueryForm
                name="Update information"
                id={props.id}
                ori_lat={props.lat}
                ori_lng={props.lng}
                ori_buildingType={props.buildingType}
                ori_floor={props.floor}
                ori_age={props.age}
                getMyHouses={props.getMyHouses}
                showForm={props.showForm}
                moveCen={props.moveCen}
                showNewHouse={props.showNewHouse}
            />
            <a onClick={deleteHouseQuery}>Delete valuate</a>
        </div>
    let style = (props.hover)?  myStyleHover: myStyle;
    
    const content = (
        <div>
            <p>平均價格: NT${priceConvert(props.avgPrice)} /坪</p>
            <p>時間: {timeConvert(props.updatedAt)}</p>
            {(props.processed)? <p>管理員估價: NT${priceConvert(props.manualPrice)} /坪</p>:<></>}
            {!isNaN(props.buildingType)?<p>類型: {BuildingType[props.buildingType]}</p> :<></>}
            {(props.floor)? <p>樓層: {props.floor} 樓</p> :<></>}
            {(props.age)? <p>屋齡: {props.age} 年</p> :<></>}
            {authFunction}
        </div>
    );
    return(
        <div className="house-pin">
        <Popover 
            placement='right'
            title={`${props.user}'s Query`}
            trigger="click"
            visible={props.click}
            content={content}
        >
            <EnvironmentFilled style={style}/>
        </Popover>
        </div>
    );
};

// ====== the pin for similar houses
const Similar_House_Pin = (props) => {
    const myStyle = {
        position: 'absolute',
        bottom: '0',
        left: '-9pt',
        fontSize: '18pt',
        color: 'rgb(240, 102, 11)'
    }
    const myStyleHover = {
        ...myStyle,
        left: '-10pt',
        fontSize: '20pt'
    }
    let style = (props.hover)?  myStyleHover: myStyle;
    const content = (
        <div>
            <p>價格: NT${priceConvert(props.unitPrice)} /坪</p>
            <p>類型: {BuildingType[props.buildingType]}</p>
            <a onClick={() => {
                props.getDetail(props.id)
            }}>more details</a>
        </div>
    );
    return(
        <div className="house-pin">
        <Popover 
            placement='top'
            title="Similar house"
            visible={props.click || props.hover}
            content={content}
            trigger="hover"
        >
            <EnvironmentFilled style={style}/>
        </Popover>
        </div>
    );
};

// ============ the pin for user when it just complete the query
const New_House_pin = (props) => {
    const myStyle = {
        position: 'absolute',
        bottom: '0',
        left: '-9pt',
        fontSize: '18pt',
        color: 'red'
    }
    const myStyleHover = {
        ...myStyle,
        left: '-10pt',
        fontSize: '20pt'
    }
    let style = (props.hover)?  myStyleHover: myStyle
    const content = (
        <div>
            <p>平均價格: NT${priceConvert(props.avgPrice)} /坪</p>
            {!isNaN(props.buildingType)?<p>類型: {BuildingType[props.buildingType]}</p> :<></>}
            {(props.floor)? <p>樓層: {props.floor} 樓</p> :<></>}
            {(props.age)? <p>屋齡: {props.age} 年</p> :<></>}
        </div>
    );
    return(
        <div className="house-pin">
        <Popover 
            placement='top'
            title="Your house"
            visible={props.showInfor || props.click}
            content={content}
            trigger="hover"
        >
            <EnvironmentFilled style={style}/>
        </Popover>
        </div>
    )
}

export {House_Pin, House_Cluster, Current_Pin, House_Eval_Pin, Similar_House_Pin, New_House_pin};