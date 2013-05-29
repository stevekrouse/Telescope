Resources = new Meteor.Collection('resources');

STATUS_PENDING=1;
STATUS_APPROVED=2;
STATUS_REJECTED=3;

Meteor.methods({
  postResource: function(resource){
    var headline = cleanUp(resource.headline),
        body = cleanUp(resource.body),
        user = Meteor.user(),
        userId = resource.userId || user._id,
        submitted = parseInt(resource.submitted) || new Date().getTime(),
        defaultStatus = STATUS_APPROVED,
        status = resource.status || defaultStatus,
        //timeSinceLastResource=timeSinceLast(user, Resources),
        //numberOfResourcesInPast24Hours=numberOfItemsInPast24Hours(user, Resources),
        //resourceInterval = Math.abs(parseInt(getSetting('resourceInterval', 30))),
        //maxresourcesPer24Hours = 10 //Math.abs(parseInt(getSetting('maxresourcesPerDay', 30))),
        resourceId = '';

    // check that user can post post
    if (!user || !canPost(user))
      throw new Meteor.Error(601, 'You need to login or be invited to post new content.');

    // check that user provided a headline
    if(!resource.headline)
      throw new Meteor.Error(602, 'Please fill in a headline');

    //if(!isAdmin(Meteor.user())){
      // check that user waits more than X seconds between posts
      //if(!this.isSimulation && timeSinceLastresource < resourceInterval)
        //throw new Meteor.Error(604, 'Please wait '+(resourceInterval-timeSinceLastresource)+' seconds before posting again');

      // check that the user doesn't resource more than Y resources per day
      //if(!this.isSimulation && numberOfresourcesInPast24Hours > maxresourcesPer24Hours)
        //throw new Meteor.Error(605, 'Sorry, you cannot submit more than '+maxresourcesPer24Hours+' resources per day');
    //}

    resource = _.extend(resource, {
      headline: headline,
      body: body,
      userId: userId,
      author: getDisplayNameById(userId),
      createdAt: new Date().getTime(),
      votes: 0,
      comments: 0,
      baseScore: 0,
      score: 0,
      inactive: false,
      status: status,
    });

    if(status == STATUS_APPROVED){
      // if resource is approved, set its submitted date (if resource is pending, submitted date is left blank)
      resource.submitted  = submitted;
    }

    Resources.insert(resource, function(error, result){
      if(result){
        resourceId = result;
      }
    });

    var resourceAuthor =  Meteor.users.findOne(resource.userId);
    Meteor.call('upvoteResource', resourceId,resourceAuthor);

    if(getSetting('newPostNotifications')){
      // notify admin of new resources
      var properties = {
        resourceAuthorName : getDisplayName(resourceAuthor),
        resourceAuthorId : resource.userId,
        resourceHeadline : headline,
        resourceId : resourceId
      }
      //var notification = getNotification('newPesource', properties);
      // call a server method because we do not have access to admin users' info on the client
     // Meteor.call('notifyAdmins', notification, Meteor.user(), function(error, result){
        //run asynchronously
     // });
    }

    // add the resource's own ID to the resource object and return it to the client
    resource.resourceId = resourceId;
    console.log(resourceId);
    return resource;
  },
  resource_edit: function(resource){
    //TO-DO: make resource_edit server-side?
  }
});
