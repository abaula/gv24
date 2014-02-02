

declare module ServerData
{

    interface AjaxServerResponse
    {
        code: string;
        userMessage: string;
        moreInfoUri: string;
        data: any;
    }
}