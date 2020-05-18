def get_differences(data, existing_values):
    new_data = [x for x in data if 'id' not in x or ('id' in x and (x['id'] is None or x['id'] <= 0))]
    updated_data = [x for x in data if 'id' in x and x['id'] > 0]
    deleted_ids = [z['id'] for z in [x for x in existing_values if 'id' in x and x['id'] not in [y['id'] for y in updated_data]]]

    return new_data, updated_data, deleted_ids