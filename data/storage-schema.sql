INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('property-images', 'property-images', TRUE, 10485760, ARRAY['image/*']);

