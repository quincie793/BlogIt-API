import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, synopsis, featuredImageUrl, content } = req.body;
    const userId = (req as any).user?.id; 
    if (!title || !synopsis || !content) {
      return res.status(400).json({ message: 'Title, synopsis, and content are required.' });
    }

    const newBlog = await client.blog.create({
      data: {
        title,
        synopsis,
        featuredImageUrl,
        content,
        userId,
        isDeleted: false
      },
    });

    res.status(201).json({
      message: 'Blog created successfully!',
      blog: newBlog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while creating the blog.' });
  }
};

// GET all blogs 
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await client.blog.findMany({
      where: {
        isDeleted: false
      },
      select: {
        id: true,
        title: true,
        synopsis: true,
        featuredImageUrl: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ blogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while fetching blogs.' });
  }
};

// GET a single blog by ID
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;

    const blog = await client.blog.findUnique({
      where: { id: blogId },
      select: {
        userId: true,
        id: true,
        title: true,
        synopsis: true,
        featuredImageUrl: true,
        content: true,
        createdAt: true,
        lastUpdated: true,
        isDeleted: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // If the blog is trashed, only allow the owner to view it
    if (blog.isDeleted) {
      const userId = (req as any).user?.id;
      if (!userId || blog.userId !== userId) {
        return res.status(404).json({ message: 'Blog not found' });
      }
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while fetching the blog.' });
  }
};

// UPDATE a blog
export const updateBlog = async (req: any, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id; 
    const { title, synopsis, featuredImageUrl, content } = req.body;

    const blog = await client.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog || blog.isDeleted) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this blog.' });
    }

    const updatedBlog = await client.blog.update({
      where: { id: blogId },
      data: {
        title,
        synopsis,
        featuredImageUrl,
        content,
        lastUpdated: new Date(),
      },
      select: {
        id: true,
        title: true,
        synopsis: true,
        featuredImageUrl: true,
        content: true,
        createdAt: true,
        lastUpdated: true,
      }
    });

    res.status(200).json({
      message: 'Blog updated successfully.',
      blog: updatedBlog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating blog.' });
  }
};

// MOVE BLOG TO TRASH
export const moveBlogToTrash = async (req: any, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;

    console.log("Authenticated user ID:", userId);
    console.log("Blog ID to trash:", blogId);

    const blog = await client.blog.findUnique({
      where: { id: blogId },
    });

    console.log("Blog fetched:", blog);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.isDeleted) {
      return res.status(400).json({ message: 'Blog is already in trash.' });
    }

    if (blog.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to move this blog to trash.' });
    }

    const updatedBlog = await client.blog.update({
      where: { id: blogId },
      data: { isDeleted: true },
    });

    console.log("Blog after moving to trash:", updatedBlog);

    res.status(200).json({ message: 'Blog moved to trash successfully.', blog: updatedBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error moving blog to trash.' });
  }
};


// RESTORE A DELETED BLOG
export const restoreBlog = async (req: any, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;

    const blog = await client.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (!blog.isDeleted) {
      return res.status(400).json({ message: 'Blog is not in trash.' });
    }

    if (blog.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to restore this blog.' });
    }

    await client.blog.update({
      where: { id: blogId },
      data: { isDeleted: false },
    });

    res.status(200).json({ message: 'Blog restored successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error restoring blog.' });
  }
};

// DELETE A BLOG PERMANENTLY
export const deleteBlogPermanently = async (req: any, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;

    const blog = await client.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }
    if (blog.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this blog.' });
    }
    await client.blog.delete({
      where: { id: blogId },
    });

    res.status(200).json({ message: 'Blog permanently deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting blog.' });
  }
};
