

module ServerData
{

    export class AjaxServerResponse
    {
        code: string;
        userMessage: string;
        moreInfoUri: string;
        data: any;
    }

    export class AjaxTask
    {
        public id: number;
        public city1: string;
        public city2: string;
        public type: string;
        public weight: number;
        public value: number;
        public distance: number;
        public cost: number;
        public readyDate: string;
        public selected: boolean;
    }

    export class AjaxTaskList
    {
        public offset: number;
        public limit: number;
        public allRowCount: number;
        public page: number;
        public tasks: AjaxTask[];
    }

    export class AjaxTaskInfo
    {
        public taskId: number;
    }

    export class AjaxTaskInfoList
    {
        public tasks: AjaxTaskInfo[];
    }

    export class AjaxIdsList
    {
        public ids: number[];
    }
}