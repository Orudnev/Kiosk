import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, ReactNode } from 'react';
import { TScenarioItemUid, TScenarioUid } from '../../scn-custom';
import './navGallery.scss';
import { error } from 'console';
import { ButtonBase, IButtonBaseProps } from '../button-base';
import { GetIconClass } from '../../../common-types';
import { TLButton } from '../../../localization';

export interface INavGalleryItemDTO {
    id: string;
    parent?: string;
    caption?: string;
    description?: string;
    imgSrc?: string;
    imgB64?: string;
    scenarioId: TScenarioUid;
    scenarioItemId: TScenarioItemUid | undefined;
    tag: any;
    requisitesName: string;
    requisitesMask?: string;
}

export type TNGridDataSource = (Promise<INavGalleryItemDTO[]>) | INavGalleryItemDTO[] | undefined;

export interface INavGalleryProps {
    dataSource?: INavGalleryItemDTO[];
    showItemsCriteria?: INavGalleryShowItemsCriteria;
    onShownItemsChanged?: (newCriteria: INavGalleryShowItemsCriteria) => void;
    onItemSelected?: (item: INavGalleryItemDTO) => void;
    getThemeId: (currCriteria: INavGalleryShowItemsCriteria) => string;
}

function getImgSrc(item: INavGalleryItemDTO) {
    if (item.imgSrc?.includes('svg')) {
        return `data:image/svg+xml;base64,${item.imgB64}`;
    }
    if (item.imgSrc?.includes('png')) {
        return `data:image/png;base64,${item.imgB64}`;
    }
    throw new Error(`Not implemented extention:${item.imgSrc}`);
}

class NgCss {
    height: number;
    width: number;
    itemWidth: number;
    itemHeight: number;
    rowGap: number;
    columnGap: number;
    navBarHeight: number;
    constructor(ngref: any) {
        this.height = parseInt(window.getComputedStyle(ngref.current).getPropertyValue('--ng-height'));
        this.width = parseInt(window.getComputedStyle(ngref.current).getPropertyValue('width'));
        this.itemWidth = parseInt(window.getComputedStyle(ngref.current).getPropertyValue('--ng-item-width'));
        this.itemHeight = parseInt(window.getComputedStyle(ngref.current).getPropertyValue('--ng-item-height'));
        this.navBarHeight = parseInt(window.getComputedStyle(ngref.current).getPropertyValue('--ng-navbar-height'));
        let gap = window.getComputedStyle(ngref.current).getPropertyValue('--ng-gap');
        this.rowGap = parseInt(gap.trim().split(' ')[0]);
        this.columnGap = parseInt(gap.trim().split(' ')[1]);;
    }
}

// export interface INgButtonProps{
//     btnId:'ngPrevPage'|'ngNextPage';
//     btnStyleType:string;
//     onClick:()=>void;
//     getChildren?:(pressed:boolean)=>ReactNode;
// }

function NgButton(props: IButtonBaseProps) {
    let styleInfo = GetIconClass(props.btnId as TLButton);
    return (
        <ButtonBase
            onClick={() => {
                props.onClick();
            }}
            btnId={props.btnId} btnStyleType='ng_button'
            getChildren={(pressed) => {
                let imgClass = styleInfo?.imageClass;
                if (pressed && styleInfo?.imageSelectedClass) {
                    imgClass = styleInfo?.imageSelectedClass;
                }
                return (
                    <img className={imgClass} />
                );
            }} />
    )
}


export interface INavGalleryShowItemsCriteria {
    type: 'RootItemsOnly' | 'ByParentId' | 'BySearchString';
    value: string;
}

export interface INavGallery {
    SetDataSource: (dataSource: INavGalleryItemDTO[], showItemsCriteria: INavGalleryShowItemsCriteria) => void;
}

interface INavGalleryItemProps {
    item: INavGalleryItemDTO;
    onClick: (item: INavGalleryItemDTO) => void;
    themeId: string;
}


export const NavGalleryItem = (props: INavGalleryItemProps) => {
    const [btnPressed, setBtnPressed] = useState(false);
    const cstr = `ng_item ng-item-theme_${props.themeId}` + (btnPressed ? ` ng-item-theme_${props.themeId}__pressed` : '');
    return (
        <div id={`ngitem_${props.item.id}`} className={cstr}
            onMouseDown={(e) => {
                e.preventDefault();
                setBtnPressed(true);
            }}
            onTouchStart={(e) => {
                e.preventDefault();
                setBtnPressed(true);
            }}
            onMouseUp={(e) => {
                e.preventDefault();
                if (btnPressed) {
                    setBtnPressed(false);
                    props.onClick(props.item);
                }
            }}
            onTouchEnd={(e) => {
                //обработчик для события от тачскрина
                e.preventDefault();
                if (btnPressed) {
                    setBtnPressed(false);
                    props.onClick(props.item);
                }
            }}
        >
            <div id='img-wrapper'>
                <img src={getImgSrc(props.item)}></img>
            </div>
            <div>{props.item.caption}</div>
        </div>
    );
}




export const NavGallery = forwardRef((props: INavGalleryProps, ngInstanceRef: any) => {
    let dfltState: INavGalleryItemDTO[] = [];
    const [allItems, setAllItems] = useState<INavGalleryItemDTO[]>(dfltState);
    const [lastCriteria, setLastCriteria] = useState<INavGalleryShowItemsCriteria>({ type: 'RootItemsOnly', value: '' });
    const [itemsToBeShown, setItemsToBeShown] = useState<INavGalleryItemDTO[]>(dfltState);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const ngref = useRef(null);
    const cssProps: any = useRef({});
    let showNavBar = false;
    let pgCount = -1;
    let themeId = props.getThemeId(lastCriteria);

    let setDataSourceImpl = (dataSource: INavGalleryItemDTO[], showItemsCriteria: INavGalleryShowItemsCriteria) => {
        setAllItems(dataSource);
        setLastCriteria(showItemsCriteria);
        if(props.onShownItemsChanged){ 
            props.onShownItemsChanged(showItemsCriteria);
        }
        setCurrentPageIndex(0);
        switch (showItemsCriteria.type) {
            case 'RootItemsOnly':
                setItemsToBeShown(dataSource.filter(itm => !itm.parent));  // показываем только корневые элементы
                break;
            case 'ByParentId':
                setItemsToBeShown(dataSource.filter(itm => itm.parent === showItemsCriteria.value));
                break;
            case 'BySearchString':
                setItemsToBeShown(dataSource.filter(itm => itm.caption?.toLowerCase().includes(showItemsCriteria.value.toLocaleLowerCase())));
                break;
        }
    };

    useImperativeHandle(ngInstanceRef, () => {
        return {
            SetDataSource(dataSource: INavGalleryItemDTO[], showItemsCriteria: INavGalleryShowItemsCriteria) {
                setDataSourceImpl(dataSource, showItemsCriteria);
            }
        }
    }, []);

    useEffect(() => {
        cssProps.current = new NgCss(ngref);
        if (props.dataSource) {
            let criteria: INavGalleryShowItemsCriteria = { type: 'RootItemsOnly', value: '' };
            if (props.showItemsCriteria) {
                criteria = props.showItemsCriteria;
            }
            setDataSourceImpl(props.dataSource, criteria);
        }
    }, [props.dataSource]);
    let currentPageItems = itemsToBeShown;
    if (cssProps.current.hasOwnProperty('height')) {
        let intDiv = (val: number, divider: number) => (val - val % divider) / divider;
        let css = cssProps.current as NgCss;
        let pgItemCountByWidth_WithoutGap = intDiv(css.width, css.itemWidth);
        let pgItemSummaryWidth_WithoutGap = css.itemWidth * pgItemCountByWidth_WithoutGap;
        let gapSummaryWidth = css.columnGap * pgItemCountByWidth_WithoutGap - css.columnGap;
        let pgItemCountByWidth = (pgItemSummaryWidth_WithoutGap + gapSummaryWidth > css.width)
            ? pgItemCountByWidth_WithoutGap - 1
            : pgItemCountByWidth_WithoutGap;

        let pgItemCountByHeight_WithoutGap = intDiv(css.height, css.itemHeight);
        let pgItemSummaryHeight_WithoutGap = css.itemHeight * pgItemCountByHeight_WithoutGap;
        let gapSummaryHeight = css.rowGap * pgItemSummaryHeight_WithoutGap - css.rowGap;
        let pgItemCountByHeight = (pgItemSummaryHeight_WithoutGap + gapSummaryHeight > css.height)
            ? pgItemCountByHeight_WithoutGap - 1
            : pgItemCountByHeight_WithoutGap;

        let itemCountByPage = pgItemCountByWidth * pgItemCountByHeight;
        let itemsCountToBeShown = itemsToBeShown.length;
        if (itemsToBeShown.length > itemCountByPage) {
            // Все элементы на одной странице не поместятся, разбиваем на страницы 
            // и отображаем страницу с номером currentPageIndex
            showNavBar = true;
            let itemsAreaHeight = css.height - css.navBarHeight;
            pgItemCountByHeight = intDiv(itemsAreaHeight, css.itemHeight + css.rowGap);
            itemCountByPage = pgItemCountByWidth * pgItemCountByHeight;
            pgCount = intDiv(itemsCountToBeShown, itemCountByPage) + (itemsCountToBeShown % itemCountByPage ? 1 : 0);
            let startPgItemIndex = currentPageIndex * itemCountByPage;
            let endPgItemIndex = startPgItemIndex + itemCountByPage - 1;
            currentPageItems = itemsToBeShown.filter((itm, idx) =>
                idx >= startPgItemIndex && idx <= endPgItemIndex
            );
        }

    }
    return (
        <div ref={ngref} className={`ng ng_theme__${themeId}`}>
            <div className='ng_content-wrapper'>
                <div className='ng_item-area'>
                    {currentPageItems.map((itm: INavGalleryItemDTO) => {
                        return (
                            <NavGalleryItem item={itm} themeId={themeId} onClick={(item) => {
                                let newCriteria: INavGalleryShowItemsCriteria = { type: 'ByParentId', value: item.id };
                                setDataSourceImpl(allItems, newCriteria);
                                if(props.onItemSelected){
                                    props.onItemSelected(item);
                                }
                            }} />
                        );
                    })}
                </div>
            </div>
            {showNavBar &&
                <div className='ng_navbar'>
                    <NgButton btnId='btnBack' btnStyleType='ng_button'
                        onClick={() => {
                            if (currentPageIndex > 0) {
                                setCurrentPageIndex(currentPageIndex - 1);
                            }
                        }} />
                    <NgButton btnId='btnNext' btnStyleType='ng_button'
                        onClick={() => {
                            if (currentPageIndex < pgCount - 1) {
                                setCurrentPageIndex(currentPageIndex + 1);
                            }
                        }} />
                </div>
            }
        </div>
    );
});

