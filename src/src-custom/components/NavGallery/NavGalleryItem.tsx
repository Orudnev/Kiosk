import React from 'react';
import NoImage from './ImgNotFound.svg';
import NavGallery,{INavGalleryItemDTO,INavGaleryProps} from './NavGallery';
import './navGallery.scss';

export interface INavGalleryItemProps {
    navGallery:NavGallery;
    data:INavGalleryItemDTO;
    onItemClick?:(itemId:string)=>void;
}

export default class NavGalleryItem extends React.Component<INavGalleryItemProps,any>{
    elmRef:any=null;        
    constructor (props:any){
        super(props);
        this.state = {
            hovered:false,
            pressed:false
        };     
        this.elmRef = React.createRef();
    }

    componentDidMount(){
        
    }

    componentDidUpdate(){
    }

    handleOnHover(isEnter:boolean) {
        this.setState({ hovered: isEnter });
    }    

    handleClick(){
        if(this.props.onItemClick){
            this.props.onItemClick(this.props.data.id);
        }
    }

    getNGProps():INavGaleryProps{
        return this.props.navGallery.props;
    }


    getStyle() {
        return {
            width: this.props.navGallery.getItemSize().width +"px",
            height: this.props.navGallery.getItemSize().height + "px",
        };
    }   
    
    renderImg(){
        let iconHeight = this.props.navGallery.getItemSize().height /2;
        let themeStr = this.getTheme();
        if(this.props.data.imgSrc){
            return(
                <img src={this.props.data.imgSrc} className={"ng-image-verticalPosition-"+themeStr}  />
            );
        } 
        return(
            <img src={NoImage} style={{height:iconHeight+"px"}} />
        );
    }

    getTheme():string{
        let ngProps:INavGaleryProps = this.getNGProps();
        let themeStr = "default";
        if(ngProps.theme){
            if(typeof(ngProps.theme) === "function"){
                themeStr = ngProps.theme(this.props.navGallery);
            } else {
                themeStr = ngProps.theme;
            }
        }
        return themeStr;        
    }

    render(){
        //let theme = this.getNGProps().theme?"-"+this.getNGProps().theme:"-default";
        const themeStr = this.getTheme();
        const clsPressed = (this.state.pressed?` ng-item-${themeStr}__active`:"");
        const labelText = this.props.data.caption?this.props.data.caption:this.props.data.id;
        return(
            <div id={"navGalleryItem_"+this.props.data.id} ref={this.elmRef} className={"ng-item-"+themeStr+clsPressed} style={this.getStyle()} 
                onMouseDown = {(e)=>{
                    e.preventDefault();
                    this.setState({pressed:true});
                }}             
                onTouchStart = {(e)=>{
                    this.setState({pressed:true});
                }}            
                onMouseUp = {(e)=>{
                    e.preventDefault();
                    if(this.state.pressed){
                        this.setState({pressed:false});
                        this.handleClick();    
                    }
                }}     
                onTouchEnd={(e)=>{
                    e.preventDefault();
                    if(this.state.pressed){
                        this.setState({pressed:false});
                        this.handleClick();    
                    }
                }}
                >                        
                <div className={"ng-image-section-"+themeStr}>
                    {this.renderImg()}
                </div>                        
                <div className={"ng-label-section-"+themeStr}>
                    {labelText}
                </div>
            </div>
        ); 
    }
}