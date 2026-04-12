# Performance Review Guide

## High-Value Checks

- Is the page unnecessarily marked with `"use client"`?
- Is the same data fetched on both server and client?
- Could a heavy widget become a lazy client island?
- Does the route show useful content before secondary data resolves?
- Are mobile layouts causing excessive hidden or duplicated DOM?

## Common Expensive Dependencies

- Rich editors
- Charting libraries
- 3D libraries
- Map libraries
- Large table abstractions
- Client-side state layers that wrap the full app
