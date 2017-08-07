var exec = require("cordova/exec");
var utils = require("cordova/utils");
var PLUGIN_NAME = "FirebaseDatabase";

function DbSnapshot(ref, data) {
    this.ref = ref;
    this.key = data.key;
    this._data = data;
}

DbSnapshot.prototype = {
    val: function() {
        return this._data.value;
    },
    getPriority: function() {
        return this._data.priority;
    }
};

function DbQuery(ref, orderBy) {
    this.ref = ref;
    this._orderBy = orderBy;
    this._includes = [];
}

DbQuery.prototype = {
    endAt: function(value, key) {
        this._includes.push({endAt: value, key: key});
        return this;
    },
    startAt: function(value, key) {
        this._includes.push({startAt: value, key: key});
        return this;
    },
    equalTo: function(value, key) {
        this._includes.push({equalTo: value, key: key});
        return this;
    },
    limitToFirst: function(limit) {
        this._limit = {first: limit};
        return this;
    },
    limitToLast: function(limit) {
        this._limit = {last: limit};
        return this;
    },
    on: function(eventType, success, error) {
        var ref = this.ref;
        var callback = function(data) {
                success(new DbSnapshot(ref, data));
            };

        callback._id = utils.createUUID();

        exec(callback, error, PLUGIN_NAME, "on",
            [callback._id, eventType, ref._path, this._orderBy, this._includes, this._limit]);

        return callback;
    },
    once: function(eventType, success, error) {
        var ref = this.ref;
        var callback = function(data) {
                success(new DbSnapshot(ref, data));
            };

        callback._id = utils.createUUID();

        exec(callback, error, PLUGIN_NAME, "once",
            [callback._id, eventType, ref._path, this._orderBy, this._includes, this._limit]);

        return callback;
    },
    off: function(eventType, callback) {
        exec(cb, errorCallback, PLUGIN_NAME, "off",
            [callback._id, eventType, this.ref._path]);
    },
    orderByChild: function(path) {
        return new DbQuery(this.ref, {child: path});
    },
    orderByKey: function() {
        return new DbQuery(this.ref, {key: true});
    },
    orderByPriority: function() {
        return new DbQuery(this.ref, {priority: true});
    },
    orderByValue: function() {
        return new DbQuery(this.ref, {value: true});
    }
};

function DbRef(path) {
    this.ref = this;
    this._path = path;
}

DbRef.prototype = new DbQuery();

module.exports = {
    ref: function(path) {
        return new DbRef(path);
    },
    goOffline: function() {

    },
    goOnline: function() {

    }
};
