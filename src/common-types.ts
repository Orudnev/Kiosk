import { TLButton } from "./localization";

export type TLang = 'ru' | 'en' | 'kz';

interface IBtnIconClassMapItem {
    uid: TLButton;
    sizeClass: string;
    imageClass?: string;
    imageSelectedClass?:string;
    iconAfterLabel?: boolean;
}

const BtnIconClassMap: IBtnIconClassMapItem[] = [
    { uid: 'btnBack', sizeClass: 'nav-button_icon1632',imageClass:'img-nav-button-btnback',imageSelectedClass:'img-nav-button-btnback-selected'},
    { uid: 'btnHome', sizeClass: 'nav-button_icon3232',imageClass:'img-nav-button-btnhome' },
    { uid: 'btnNext', sizeClass: 'nav-button_icon1632',imageClass:'img-nav-button-btnnext', iconAfterLabel:true},
]

export function GetIconClass(uid: TLButton) {
    return BtnIconClassMap.find(itm=>itm.uid === uid);
}
