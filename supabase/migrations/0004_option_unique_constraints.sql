-- Benama Cuisines — uniqueness for option groups/choices.
-- Prevents duplicate groups per item and duplicate choices per group, and lets
-- the option seed upsert instead of re-inserting on every run.

alter table item_option_groups
  add constraint item_option_groups_item_name_unique unique (item_id, name);

alter table item_options
  add constraint item_options_group_name_unique unique (group_id, name);
