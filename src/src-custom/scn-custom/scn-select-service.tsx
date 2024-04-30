import React from 'react';
import { StpMainForm } from '../stp-custom/stp-main-form';
import { ScnItemBase } from '../../src-system/scn-engine/scn-base';
import { ApiWrapper, ICommonReslult, IProfileItemDTO } from '../../apiwrapper';
import { INavGalleryItemDTO } from '../components/NavGallery/NavGallery';
import { TScenarioUid } from '.';
import { store } from '../reducers';
import { AppGlobal } from '../../app';


export const ScnSelectService: any[] = [
    (<StpMainForm 
        btnFunc={(step: any) => {
            if (store.getState().StepProps.NavGalleryData.lastCriteria.type === 'RootItemsOnly') {
                return "";
            }
            return "btnHome";
        }}
        messageFunc={(step: any)=>{
            let criteria = store.getState().StepProps.NavGalleryData.lastCriteria;
            if (criteria.type === 'RootItemsOnly') {
                return "Wellcome";
            }
            if(criteria.type === 'ByParentId'){
                let currParent = store.getState().StepProps.NavGalleryData.items.find(itm=>itm.id === criteria.value);
                if(currParent){
                    return currParent.description;
                } 
            }
        }}
        extraProps={{
            dataSource: () => store.getState().StepProps.NavGalleryData.items,
            showItemsCriteria: () => store.getState().StepProps.NavGalleryData.lastCriteria
        }}
        scnItem={new ScnItemBase({
            scnUid: 'main',
            scnItemUid: 'main',
            inlineHandlers: [
                {
                    name: 'DidMount', handler: async (step) => {
                        let serviceTree = await gItemTree();
                        store.dispatch({ type: 'Act_SP_DefineServiceTreeItems', items: serviceTree });
                    }
                },
                {
                    name: 'KeyDown', handler: async (e)=>{
                        if(e.ctrlKey && e.altKey && e.key.toLowerCase() == "s"){
                            AppGlobal.navigate('config_main');
                        }
                    }
                }
            ]
        })}
    />)
];

const imgNotFoundB64 = "ICAgIDxzdmcNCiAgICAgICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIg0KICAgICAgICBmaWxsUnVsZT0iZXZlbm9kZCINCiAgICAgICAgc3Ryb2tlTGluZWpvaW49ImJldmVsIg0KICAgICAgICBzdHJva2VXaWR0aD0iMC41MDEiDQogICAgICAgIG92ZXJmbG93PSJ2aXNpYmxlIg0KICAgICAgICB2aWV3Qm94PSIwIDAgOTYgOTYiDQogICAgPg0KICAgICAgICA8Zw0KICAgICAgICAgICAgZmlsbD0ibm9uZSINCiAgICAgICAgICAgIHN0cm9rZT0iIzAwMCINCiAgICAgICAgICAgIGZvbnRGYW1pbHk9IlRpbWVzIE5ldyBSb21hbiINCiAgICAgICAgICAgIGZvbnRTaXplPSIxNiINCiAgICAgICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMSAtMSkiDQogICAgICAgID4NCiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgLTk2KSI+DQogICAgICAgICAgICAgICAgPGcgc3Ryb2tlTWl0ZXJsaW1pdD0iNzkuODQiPg0KICAgICAgICAgICAgICAgICAgICA8cGF0aA0KICAgICAgICAgICAgICAgICAgICAgICAgZmlsbD0iZGFya2JsdWUiDQogICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U9Im5vbmUiDQogICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD0iMC41Ig0KICAgICAgICAgICAgICAgICAgICAgICAgZD0iTTI1LjQ1OCAyNC45NDVjLTMuNTE4IDMuNTA5LTMuNTI1IDkuMjExLS4wMTcgMTIuNzI4bDEwLjEyNiAxMC4xNTItMTAuMTUxIDEwLjEyNmMtMy41MTggMy41MDktMy41MjUgOS4yMTEtLjAxNyAxMi43MjggMy41MDkgMy41MTggOS4yMTEgMy41MjUgMTIuNzI4LjAxN2wxMC4xNTItMTAuMTI3IDEwLjEyNiAxMC4xNTJjMy41MDkgMy41MTggOS4yMTEgMy41MjUgMTIuNzI4LjAxNyAzLjUxOC0zLjUwOSAzLjUyNS05LjIxMS4wMTctMTIuNzI4TDYxLjAyMyA0Ny44NTdsMTAuMTUyLTEwLjEyNWMzLjUxOC0zLjUwOSAzLjUyNS05LjIxMS4wMTctMTIuNzI4LTMuNTA5LTMuNTE4LTkuMjExLTMuNTI1LTEyLjcyOC0uMDE3TDQ4LjMxMSAzNS4xMTMgMzguMTg2IDI0Ljk2MmMtMy41MDktMy41MTgtOS4yMTEtMy41MjUtMTIuNzI4LS4wMTd6Ig0KICAgICAgICAgICAgICAgICAgICA+PC9wYXRoPg0KICAgICAgICAgICAgICAgICAgICA8cGF0aA0KICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlPSJub25lIg0KICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlTGluZWNhcD0icm91bmQiDQogICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VMaW5lam9pbj0ibWl0ZXIiDQogICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD0iNC41Ig0KICAgICAgICAgICAgICAgICAgICAgICAgZD0iTTguMDg5IDc3LjczN1YxNy41MDhjMC02LjIyOSA1LjA1Ni0xMS4yODUgMTEuMjg1LTExLjI4NWg1OS4zMjljNi4yMjkgMCAxMS4yODUgNS4wNTYgMTEuMjg1IDExLjI4NXY2MC4yMjljMCA2LjIyOS01LjA1NiAxMS4yODUtMTEuMjg1IDExLjI4NUgxOS4zNzRjLTYuMjI5IDAtMTEuMjg1LTUuMDU2LTExLjI4NS0xMS4yODV6Ig0KICAgICAgICAgICAgICAgICAgICA+PC9wYXRoPg0KICAgICAgICAgICAgICAgICAgICA8cGF0aA0KICAgICAgICAgICAgICAgICAgICAgICAgZmlsbD0icmVkIg0KICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlPSJub25lIg0KICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9IjAuNSINCiAgICAgICAgICAgICAgICAgICAgICAgIGQ9Ik0yOC42MzYgMjguMTMxYTQuNTAyIDQuNTAyIDAgMDAtLjAwOSA2LjM2NGwxMy4zMDQgMTMuMzM4LTEzLjMzNyAxMy4zMDRhNC41MDIgNC41MDIgMCAwMC0uMDA5IDYuMzY0IDQuNTAyIDQuNTAyIDAgMDA2LjM2NC4wMDlsMTMuMzM4LTEzLjMwNSAxMy4zMDQgMTMuMzM4YTQuNTAyIDQuNTAyIDAgMDA2LjM2NC4wMDkgNC41MDIgNC41MDIgMCAwMC4wMDktNi4zNjRMNTQuNjU5IDQ3Ljg0OWwxMy4zMzgtMTMuMzAzYTQuNTAyIDQuNTAyIDAgMDAuMDA5LTYuMzY0IDQuNTAyIDQuNTAyIDAgMDAtNi4zNjQtLjAwOUw0OC4zMDMgNDEuNDc3IDM1IDI4LjE0YTQuNTAyIDQuNTAyIDAgMDAtNi4zNjQtLjAwOXoiDQogICAgICAgICAgICAgICAgICAgID48L3BhdGg+DQogICAgICAgICAgICAgICAgPC9nPg0KICAgICAgICAgICAgPC9nPg0KICAgICAgICA8L2c+DQogICAgPC9zdmc+DQo=";

async function gItemTree() {
    const navGalleryItems: INavGalleryItemDTO[] = [];
    const getProfileResult = await ApiWrapper.GetProfile();
    const loadImgPromises = [];
    const imageNotFoundPr = () => new Promise(resolve => imgNotFoundB64);
    if (getProfileResult.isOk) {
        let profile = (getProfileResult.result as any).resource as IProfileItemDTO[];
        for (var i = 0; i < profile.length; i++) {
            var item: INavGalleryItemDTO = {
                tag: profile[i],
                id: profile[i].id,
                parent: profile[i].parentId,
                caption: profile[i].name,
                description: profile[i].description,
                scenarioId: profile[i].scenario != null ? profile[i].scenario as TScenarioUid : "main" as TScenarioUid,
                imgSrc: `NGalleryImg/${profile[i].image}`,
                scenarioItemId: undefined,
                requisitesName: profile[i].requisitesName,
                requisitesMask: profile[i].requisitesMask
            };
            if (item.imgSrc) {
                let newPromise = ApiWrapper.GetFileResource(item.imgSrc);
                loadImgPromises.push(newPromise);
            } else {
                let newPromise = imageNotFoundPr();
                loadImgPromises.push(newPromise);
            }
            navGalleryItems.push(item);
        }
        let loadResult = await Promise.allSettled(loadImgPromises);
        loadResult.forEach((result, idx) => {
            if (result.status === 'fulfilled') {
                navGalleryItems[idx].imgB64 = result.value as string;
            } else {
                navGalleryItems[idx].imgB64 = imgNotFoundB64;
            }
        });
    }
    return navGalleryItems;
}