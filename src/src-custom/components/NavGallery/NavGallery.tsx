import React, { createRef } from 'react';
import { TScenarioUid,TScenarioItemUid } from '../../scn-custom'; 
import NavGalleryItem from './NavGalleryItem';
import './navGallery.scss';


export enum Theme {
    default = "default",
    darkBlue = "darkBlue",
}

export interface INavGalleryItemDTO {
    id: string;
    parent?: string;
    caption?: string;
    description?: string;
    imgSrc?: string;
    scenarioId: TScenarioUid;
    scenarioItemId: TScenarioItemUid|undefined;
    tag:any;
    requisitesName: string;
    requisitesMask?: string;
}

export interface INavGallerySelectedItemDTO {
    id?: string;
    description?: string;
}

export interface IProfileItemDTO {
    id: string;
    name?: string;
    description?: string;
    scenario: string;
    parentId?: string;
    image?: string;
    requisitesName: string;
    requisitesMask?: string;
}

export type TNGridDataSource = (ng: NavGallery) => INavGalleryItemDTO[] | INavGalleryItemDTO[];

export type TSize = {
    width: number;
    height: number;
}

export type TGotoParentMode = 'internal' | 'external';

export interface INavGaleryProps {
    dataSource: TNGridDataSource;
    currNodeId?: string;
    itemSize: TSize | ((ng: NavGallery) => TSize);
    //При выборе child элемента у которого есть свои child-ы автоматически отрисовыватся кнопка "Back <-" 
    //для возврата на уровень parent-a. В случае если дефолтную кнопку "Back" понадобится заменить кастомной кнопкой
    //отрисованной каким-то внешним комонентом, необходимо установить doNotRenderDefaultBackButton=false, а при  
    //нажатии на кастомную кнопку "back" установить INavGaleryProps.currNodeId соответствующий parent-у 
    doNotRenderDefaultBackButton?: boolean;
    onNodeContainingChildrenClicked?: (item: INavGalleryItemDTO) => void;
    onLeafItemClicked?: (item: INavGalleryItemDTO) => void;
    theme?: ((ng: NavGallery) => Theme) | Theme;
    allowUseNavBarSpaceForItems?:boolean; //бывает ситуация когда все элементы можно уместить на одной странице 
                                          //используя пространство навбара (когда для того, чтобы поместить все
                                          //элементы на одной странице не хватает совсем не много места, сам навбар 
                                          //в этой ситуации не нужен, так как страница только одна)  
                                          //если allowUseNavBarSpaceForItems != true, то пространство навбара не будет
                                          //использоваться для отрисовки кнопок. если параметр allowUseNavBarSpaceForItems
                                          //не указан, то считается, что  allowUseNavBarSpaceForItems = false
}

interface INavGaleryState {
    currNodeId?: string;
    selectedPageIndex: number;
    galleryWidth: number;
    galleryHeight: number;
    spaceBetweenElmHor:number;
    spaceBetweenElmVert:number;
}

interface Paging {
    itemAreaHeight: number;
    pageCount: number;
    pageItems: INavGalleryItemDTO[];
}

export default class NavGallery extends React.Component<INavGaleryProps, INavGaleryState>{
    elmRef = createRef<HTMLDivElement>();
    navBarRef = createRef<HTMLDivElement>();
    navBarHeight = 110;
    constructor(props: any) {
        super(props);
        this.state = {
            currNodeId: undefined,
            selectedPageIndex: 0,
            galleryWidth: 0,
            galleryHeight: 0,
            spaceBetweenElmHor:0,
            spaceBetweenElmVert:0
        };
        this.handleOnResize = this.handleOnResize.bind(this);
    }
 
    componentDidMount() {
        this.handleOnResize();
        window.addEventListener('resize', this.handleOnResize);
    }

    componentDidUpdate(prevProps: Readonly<INavGaleryProps>, prevState: Readonly<INavGaleryState>, snapshot?: any): void {
        if(prevProps.currNodeId && !this.props.currNodeId){
            this.setState({currNodeId:'',selectedPageIndex:0})
            return;
        }
        if (this.props.currNodeId !== this.state.currNodeId) {
            this.setState({ currNodeId: this.props.currNodeId });
        }
        this.syncTheme();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleOnResize);
    }

    syncTheme(){
        if (!this.elmRef.current) {
            return;
        }
        let themeStr = Theme.default;
        if (typeof(this.props.theme)==="function"){
            themeStr = this.props.theme(this)
        } else {
            if(this.props.theme){
                themeStr = this.props.theme;
            }
        }
        let currClass = "";
        let horSpace = 0;
        let vertSpace = 0;
        if(this.elmRef.current){
            currClass = this.elmRef.current.className;
            horSpace = parseInt(window.getComputedStyle(this.elmRef.current).columnGap);
            vertSpace = parseInt(window.getComputedStyle(this.elmRef.current).rowGap);
        }
        if(this.state.spaceBetweenElmHor != horSpace || this.state.spaceBetweenElmVert != vertSpace){
            this.setState({
                spaceBetweenElmHor:horSpace,
                spaceBetweenElmVert:vertSpace
            });
        }            
    }

    getAllTreeNodes(): INavGalleryItemDTO[] {
        if (typeof (this.props.dataSource) === 'function') {
            return this.props.dataSource(this);
        }
        return this.props.dataSource;
    }

    getNodes(): INavGalleryItemDTO[] {
        let allTreeNodes = this.getAllTreeNodes();
        let result = [];
        if (this.state.currNodeId) {
            result = allTreeNodes.filter(itm => itm.parent === this.state.currNodeId);
        } else {
            result = allTreeNodes.filter(itm => !itm.parent);
        }
        return result;
    }

    getItemSize(): TSize {
        let result: TSize;
        if (typeof (this.props.itemSize) == "function") {
            let itmSize: TSize = this.props.itemSize(this);
            result = { width: itmSize.width, height: itmSize.height };
        } else {
            result = { width: this.props.itemSize.width, height: this.props.itemSize.height };
        }
        return result;
    }

    getNavBarHeight() {
        // if(this.navBarHeight === 0){
        //     this.navBarHeight = (this.navBarRef.current ? this.navBarRef.current.offsetHeight : 0);
        // }
        return this.navBarHeight;
    }

    getCurrPageItems(): Paging {
        let allItems = this.getNodes();
        let allItemsCount = allItems.length;
        let itmSize = this.getItemSize();
        let itemWidthInPixels = itmSize.width;
        let itemHeightInPixels = itmSize.height;
        if (typeof (this.props.itemSize) == "function") {
            let itmSize: TSize = this.props.itemSize(this);
            itemWidthInPixels = itmSize.width;
            itemHeightInPixels = itmSize.height;
        } else { 
            itemWidthInPixels = this.props.itemSize.width;
            itemHeightInPixels = this.props.itemSize.height;
        }
        let navBarHeight = this.getNavBarHeight();
        let itemHeightFull = itemHeightInPixels + this.state.spaceBetweenElmVert;
        let columnCount = Math.trunc(this.state.galleryWidth / itemWidthInPixels);
        if(itemWidthInPixels*columnCount + this.state.spaceBetweenElmHor*(columnCount-1)>this.state.galleryWidth){
            columnCount = columnCount - 1;
        }
        let itemAreaHeightMultiPage = this.state.galleryHeight - navBarHeight;
        let itemAreaHeightOnePage = this.state.galleryHeight;
        if(!this.props.allowUseNavBarSpaceForItems){
            itemAreaHeightOnePage = itemAreaHeightMultiPage;
        } 
        let getRowCount = (itmAreaH: number) => Math.trunc(itmAreaH / itemHeightFull);
        let rowCount = getRowCount(itemAreaHeightOnePage);
        let itmAreaHeight = itemAreaHeightOnePage;
        let itemsCountPerPage = columnCount * rowCount;
        let pgCount = Math.trunc(allItemsCount / itemsCountPerPage) + (allItemsCount % itemsCountPerPage === 0 ? 0 : 1);
        let firstPgItmIndex = this.state.selectedPageIndex * itemsCountPerPage;
        let lastPgItmIndex = firstPgItmIndex + itemsCountPerPage - 1;
        let pgItems = allItems.filter((itm, index) => (index >= firstPgItmIndex && index <= lastPgItmIndex));
        if (pgCount > 1 || (pgItems.length > 0 && pgItems[0].parent)) {
            rowCount = getRowCount(itemAreaHeightMultiPage);
            itmAreaHeight = itemAreaHeightMultiPage;
            itemsCountPerPage = columnCount * rowCount;
            pgCount = Math.trunc(allItemsCount / itemsCountPerPage) + (allItemsCount % itemsCountPerPage === 0 ? 0 : 1);
            firstPgItmIndex = this.state.selectedPageIndex * itemsCountPerPage;
            lastPgItmIndex = firstPgItmIndex + itemsCountPerPage - 1;
            pgItems = allItems.filter((itm, index) => (index >= firstPgItmIndex && index <= lastPgItmIndex));
        }
        let rv: Paging = {
            itemAreaHeight: itmAreaHeight,
            pageCount: pgCount,
            pageItems: pgItems
        };
        if(rv.pageItems.length>0){
            let s=1;
        }
        return rv;
    }

    handlePgBackButtonClick() {
        if(this.state.selectedPageIndex>0){
            this.setState({selectedPageIndex:this.state.selectedPageIndex-1});
        }
    }
    handlePgNextButtonClick(){
        let pg = this.getCurrPageItems();
        if(this.state.selectedPageIndex<pg.pageCount-1){
            this.setState({selectedPageIndex:this.state.selectedPageIndex+1});
        }
    }
 
    handleItemClick(itemId: string) {
        let currItm = this.getNodes().find(itm => itm.id === itemId);
        if (this.hasChildren(itemId)) {
            if (this.props.onNodeContainingChildrenClicked && currItm) {
                this.props.onNodeContainingChildrenClicked(currItm);
            }
            this.setState({ currNodeId: itemId,selectedPageIndex:0 });
        } else {
            if (this.props.onLeafItemClicked) {
                let currItm = this.getNodes().find(itm => itm.id === itemId);
                if (currItm) {
                    this.props.onLeafItemClicked(currItm);
                }
            }
        }
    }

    handleOnResize() {
        let clWidth = 0;
        let clHeight = 0;
        if (this.elmRef.current) {
            clWidth = this.elmRef.current.offsetWidth;
            if (this.elmRef.current.parentElement) {
                clHeight = this.elmRef.current.parentElement.offsetHeight;
            }
        }
        // let maxHeight = 500;
        // if(maxHeight){
        //     clHeight = clHeight<maxHeight?clHeight:maxHeight;
        // }
        this.setState({
            galleryWidth: clWidth,
            galleryHeight: clHeight,
            selectedPageIndex: 0
        });
    }

    handlePgButtonClick(newPgIndex: number) {
        this.setState({ selectedPageIndex: newPgIndex });
    }

    hasChildren(nodeId: string): boolean {
        let rv = this.getAllTreeNodes().some(itm => itm.parent && itm.parent === nodeId);
        return rv;
    }


    renderItems() {
        if (!this.elmRef.current) {
            return (<div />);
        }
    
        let pgInfo = this.getCurrPageItems();
        let items = pgInfo.pageItems.map((itm: INavGalleryItemDTO) => {
            return (
                <NavGalleryItem
                    navGallery={this}
                    key={itm.id}
                    data={itm}
                    onItemClick={(itemId: any) => this.handleItemClick(itemId)}
                />
            );
        });
        let theme = "ng-itemarea-flexcontainer-default";
        if (typeof (this.props.theme) === "function") {
            theme = "ng-itemarea-flexcontainer-" + this.props.theme(this);
        } else {
            if (this.props.theme) {
                theme = "ng-itemarea-flexcontainer-" + this.props.theme;
            }
        }
        return (
            <div id="itemArea" style={{ height: pgInfo.itemAreaHeight + "px" }}>
                <div id="itemAreaFlexContainer" className={theme} style={{ rowGap: this.state.spaceBetweenElmVert+"px", columnGap:this.state.spaceBetweenElmHor+"px" }} >
                    {items}
                </div>
            </div>
        );
    }

    renderNavBarContent() {
        if (!this.navBarRef ) {
            return (<div />);
        }
        let pg = this.getCurrPageItems();
        if (pg.pageItems.length == 0) {
            return (<div />);
        }
        let isRootPage = !pg.pageItems[0].parent;
        let pageButtons = [];
        if (pg.pageCount > 1) {
            if(pg.pageCount>1){
                let btnBack = <div key={"btnPgBack"} className="ng-btn-regular" 
                    onClick={() => this.handlePgBackButtonClick()}
                    onTouchEnd={() => this.handlePgBackButtonClick()}
                    > 
                        {"<"}</div>;
                pageButtons.push(btnBack);    
            }
            // for (let i: number = 0; i < pg.pageCount; i++) {
            //     let newBtn = 
            //     <div key={i} className="ng-btn-regular" 
            //         onClick={() => this.handlePgButtonClick(i)}
            //         onTouchEnd={() => this.handlePgButtonClick(i)}
            //         >
            //             {i + 1}
            //     </div>;
            //     if (i === this.state.selectedPageIndex) {
            //         newBtn = <div key={i} className="ng-btn-highlighted">{i + 1}</div>;
            //     }
            //     pageButtons.push(newBtn);
            // }
            if(pg.pageCount>1){
                let btnBack = 
                <div key={"btnPgNext"} className="ng-btn-regular" 
                    onClick={() => this.handlePgNextButtonClick()}
                    onTouchEnd={() => this.handlePgNextButtonClick()}
                    >
                        {">"}
                </div>;
                pageButtons.push(btnBack);    
            }
        }
        return (
            <div className="ng-navbar__content">
                {pageButtons}
            </div>
        );
    }

    render() {
        let ngGapClassStr = "";
        if(this.props.theme){
            let theme = (typeof(this.props.theme)==='function'?this.props.theme(this):this.props.theme);
            ngGapClassStr = " ng-gap-" + theme;
        }
        let clsStr = "ngroot"+ngGapClassStr;
        return (
            <div id="NavGallery" className={clsStr}
                ref={this.elmRef}
            >
                {this.renderItems()}
                <div className="ng-navbar" ref={this.navBarRef} >
                    {this.renderNavBarContent()}
                </div>
            </div>
        );
    }
}