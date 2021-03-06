import { DateTime } from 'luxon';
import { ReactionType } from './enums.js';
//import { ActivityResponse } from '../interfaces';
import { Entity } from './entity.js';
import { Editor } from '../components/editor.js';

interface ActivityInfo {
    id: string;
    content: string;
    created: string;
    reactions?: any;
    restreamId?: string;
    replyIds?: string[];
    parentId?: string;
}

export class Activity {

    static editor: Editor = new Editor();

    id: string = "";
    content: string = "";
    created: DateTime = DateTime.local();
    author: Entity | undefined;
    // selectedReaction: Reaction | undefined;
    reactionCount: Map<ReactionType,number> = new Map<ReactionType,number>();
    restream?: Activity;
    replies: Activity[] = [];
    parent?: Activity;

    static create(dataObj: ActivityInfo) {
        let activity = new Activity();
        activity.id = dataObj.id;
        dataObj.reactions?.forEach(r => activity.reactionCount.set(r.type, r.count));
        activity.content = Activity.editor.deserialize(JSON.parse(dataObj.content));
        activity.created = DateTime.fromISO(dataObj.created);
        return activity;
    }
}

    // explicit const {one,two} = dataObj
    // -- or --
    // Object.assign(this, dataObj);