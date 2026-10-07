# AWE Faith privacy analytics

This implementation stores only the app ID, a random per-app browser ID, event type, optional resource ID, and calendar date. It does not store names, IP addresses, location, prayer requests, comments, or Bible notes. The ID is pseudonymous, browser-specific, and separate for every app. Clearing site data can make an existing browser appear new.

Events are stored in the private `awe_analytics.daily_events` schema on the existing Supabase project. Direct public reads and writes are blocked; the Edge Function performs validated writes. The AWE Faith app records app opens and resource launches. Bible Journey and Church Challenge additionally record direct opens, game starts, and game completions. For the other linked apps, AWE Faith records launches from its catalog; their own source is not available in this repository.

## View new and returning browsers in Supabase SQL Editor

```sql
with first_open as (
  select app_id, device_id, min(event_date) as first_seen
  from awe_analytics.daily_events
  where event_name = 'app_open'
  group by app_id, device_id
),
recent as (
  select distinct app_id, device_id
  from awe_analytics.daily_events
  where event_name = 'app_open'
    and event_date >= current_date - 29
)
select
  r.app_id,
  count(*) filter (where f.first_seen >= current_date - 29) as new_browsers_30d,
  count(*) filter (where f.first_seen < current_date - 29) as returning_browsers_30d
from recent r
join first_open f using (app_id, device_id)
group by r.app_id
order by r.app_id;
```

## View app activity and catalog launches

```sql
select app_id, event_name, resource_id, event_date, count(*) as event_count
from awe_analytics.daily_events
where event_date >= current_date - 29
group by app_id, event_name, resource_id, event_date
order by event_date desc, app_id, event_name;
```

`app_open` represents one browser tab session. `resource_open` represents a catalog launch from AWE Faith. For the other four linked sites, this measures launches from the catalog until their source can be updated to record direct visits.
