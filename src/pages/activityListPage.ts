import { DataStore } from "../dataStore";
import { ApiClient } from "../apiClient";
import { Activity } from "../models/activity";
import { ActivityInput } from "../components/activityInput";
import { ActivityItem } from "../components/activityItem";

import { html, render, TemplateResult } from 'lit-html';
import { ActivityList } from "../components/activityList";
import { classMap } from "lit-html/directives/class-map";

export class ActivityListPage {

  private static _instance: ActivityListPage;
  private _store: DataStore;
  private _root: HTMLElement;
  private _activities: Activity[] = [];
  private _isLoading: boolean = false;

  _template(): TemplateResult {
    return html`
    <style type="text/css">
      activity-list .loadingMsg {
        display:none;
      }
      activity-list.loading .loadingMsg {
        display:block;
      }

    </style>

      <div id="grid" @click=${this.routeClick}>
        <div class="leftNav">
            <heading>
                <h1>STREAMS</h1>
            </heading>
            <div>
                <a href="/somewhere">About</a>
                <h3>@ - Connect</h3>
                <h3># - Discover</h3>
                <h3>P - Me</h3>
                <h3>S - Search</h3>
                <h3>L - Lists</h3>
                <h3>G - Settings</h3>
            </div>
        </div>

        <div class="main" @publishActivity=${this.publishActivity}>
            <activity-input></activity-input>
            <h2 style="background-color:lightblue; padding:0.4rem; margin-top:1rem;">Now Showing: <span>Your Feed</span></h2>
            <activity-list class="scrollable ${classMap({loading: this._isLoading})}" .activities=${this._activities} @restreamActivity=${this.restreamActivity}></activity-list>
        </div>

        <div class="infoCol">
            <form>
                <input class="form-control" type="text" id="searchInput" />
            </form>
        </div>
      </div>`
  };

  private constructor(rootElem, store) {
    this._root = rootElem;
    this._store = store;
  }

  public static async render(container: HTMLElement, store: DataStore) {
    if (this._instance == undefined) {
      this._instance = new this(container, store);
    }

    // turn this to a promise?  then show a loading status message while it's not resolved...
    this._instance._isLoading = true;
    this._instance._store.loadActivities({}).then((activities) => {
      this._instance._activities = activities.filter(a => a.parent == undefined);
      this._instance._isLoading = false;
      console.log("B", this._instance._isLoading);
      this._instance._update();
    });
    //this._instance._activities = await this._instance._store.loadActivities({});

    //await this._instance.store.getReactions();

    // this._instance.store.addActivities(activities.map(a => Activity.create(a)));
    // this._instance.store.addEntities(entities.map(e => Entity.create(e)));

    // const reactions = await this._instance.client.getReactions();
    // reactions.forEach(r => {
    //   this._instance.store.addReaction(r.activityId, r.type);
    // });
    console.log("A", this._instance._isLoading);
    this._instance._update();
    //return this._instance;
  }

  _update = () => {
    render(this._template(), this._root);
  }

  private publishActivity = async (evt: Event) => {

    console.log("New event {0}", evt);
    let publishEvent = evt as CustomEvent;

    let restreamId = ((evt.target as ActivityInput).embedded as ActivityItem)?.id ?? undefined;

    // may throw errors..
    let newActivity = await this._store.saveActivity({
      content: publishEvent.detail.content,
      restreamOf: restreamId,
      replyTo: publishEvent.detail.replyTo
    });

    console.log("save activity to data store is complete... ", newActivity.parent?.replies.length);

    this._activities = [...this._store._activities.values()].filter(a => a.parent == undefined);
    // // if the activity is not a reply to an existing activity...
    // //  add to the list of displayed activities
    // if (!newActivity.parent) {
    //   this._activities.unshift(newActivity);
    // }
    console.log("activities for ActivitiesList updated, update not yet called.");
    (publishEvent.detail.inputElem as ActivityInput).reset();
    this._update();
  }

  private updateReaction = async (evt: Event) => {
    console.log("Reaction has been updated...");

    // should pass the old value and the new value
    let newReaction = (evt as CustomEvent).detail.newReaction;
    let prevReaction = (evt as CustomEvent).detail.previousReaction;
    let activityElem = <ActivityItem>evt.target;

    if (activityElem.id == null) {
      return console.warn("failed to retrieve ActivityId from activity-item element.");
    }

    // FIX
    // let success = await this.client.updateReaction(activityElem.activityId, newReaction);
    // if (!success) {
    //   activityElem.undoReactionChange("API call failed to update reaction");
    // }

  }

  private restreamActivity = (evt: Event) => {

    const restreamEvent = evt as CustomEvent;
    console.log("set the activity input box with the activity item ", restreamEvent.detail);

    // grab the first activity input element on the page (should update to an ID?)
    let activityInput = <ActivityInput>this._root.querySelector('div.main activity-input');

    // idea:
    //  get the activity id, get the activity data, build new activityitem from that
    // better to create a new Activity-Input element with values than cloning an existing node ??
    let sourceActivity = restreamEvent.detail.activityElem as ActivityItem;
    activityInput.embedded = (sourceActivity as ActivityItem).clone();
    console.log("set embedded property");
    evt.stopPropagation();
  }

  private commentOnActivity = (evt: Event) => {
    console.log(evt);
    console.log("evt.target that's the button....");
    (evt.target as HTMLElement).append(new ActivityInput());
  }

  private shareActivity = (evt: Event) => {
    // generate mailto link and 'click' it.

  }


  private updateActivityList = () => {

    // let editor = new Editor();
    // this._activityList = this._activityList.map(a => {
    //   a.content = editor.deserialize(a.content);
    //   return a;
    // });

    // let activityListElem = document.getElementById('activityList');
    // this._dataStore._activities.forEach(a => {
    //   if (a.parentId != undefined) return;
    //   let activityItem = ActivityItem.create(a, this._dataStore._entities.get(a.authorId));
    //   activityItem.content = editor.deserialize(activityItem.content);
    //   if (a.restream) {
    //     let restreamedActivity = this._dataStore._activities.get(a.restream)!;
    //     if (!restreamedActivity) { throw Error("activity not found in datastore: " + a.restream); }
    //     activityItem.restreamedActivity = ActivityItem.create(restreamedActivity, this._dataStore._entities.get(restreamedActivity?.authorId));
    //     activityItem.restreamedActivity.content = editor.deserialize(activityItem.restreamedActivity.content);
    //     activityItem.restreamedActivity.hideControls = true;
    //   }
    //   activityItem.replies = a.replies.map(r => {
    //     let replyActivity = this._dataStore._activities.get(r);
    //     if (!replyActivity) { throw Error("activity not found in datastore: " + r); }
    //     let aItem = ActivityItem.create(replyActivity, this._dataStore._entities.get(replyActivity?.authorId));
    //     aItem.content = editor.deserialize(aItem.content);
    //     return aItem;
    //   });
    //   activityListElem?.append(activityItem);
    // });
  }


  routeClick = (evt) => {
    let routePath = "";
    const target = evt.target as HTMLElement;
    switch (target.tagName) {
      case "A":
        routePath = (target as HTMLAnchorElement).href;
        evt.preventDefault();
        break;
      case "ACTIVITY-ITEM":
        const originalTarget = evt.originalTarget as HTMLElement;
        if (originalTarget.tagName != 'SPAN') { return; }
        if (originalTarget.classList.contains('prosemirror-mention-node')) {
          routePath = '/e/' + originalTarget.getAttribute('data-mention-email');
        }

        if (originalTarget.classList.contains('prosemirror-tag-node')) {
          routePath = '/t/' + originalTarget.getAttribute('data-tag');
        }
        break;
      default:
        return;
    }

    if (routePath.length == 0) return;

    document.dispatchEvent(new CustomEvent('route', {
      bubbles: true,
      detail: {
        path: routePath
      }
    }));
    return false;
  }

}