/*
 * File   : $Source: /alkacon/cvs/opencms/src-components/org/opencms/applet/upload/OfficeFilter.java,v $
 * Date   : $Date: 2009/06/04 14:36:24 $
 * Version: $Revision: 1.13 $
 *
 * This library is part of OpenCms -
 * the Open Source Content Management System
 *
 * Copyright (c) 2002 - 2009 Alkacon Software GmbH (http://www.alkacon.com)
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * For further information about Alkacon Software GmbH, please see the
 * company website: http://www.alkacon.com
 *
 * For further information about OpenCms, please see the
 * project website: http://www.opencms.org
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

package org.opencms.applet.upload;

import java.io.File;

import javax.swing.filechooser.FileFilter;

/**
 * Filter for fileselector box, filters office files.<p>
 * 
 * Filetypes returned by this filter are DOC, XLS, PPT and PDF.
 * Based on the Java 1.4 example.<p>
 *
 * @author Michael Emmerich 
 * 
 * @version $Revision: 1.13 $ 
 * 
 * @since 6.0.0 
 */
public class OfficeFilter extends FileFilter {

    /** Constant for pre selection. */
    public static final String FILTER_ID = "officefilter";

    /**
     * Accept all directories and all doc, xls, ppt, pdf files.
     * @see javax.swing.filechooser.FileFilter#accept(java.io.File)
     */
    public boolean accept(File f) {

        if (f.isDirectory()) {
            return true;
        }

        return FileUploadUtils.isOfficeExtension(FileUploadUtils.getExtension(f));
    }

    /**
     * @see javax.swing.filechooser.FileFilter#getDescription()
     */
    public String getDescription() {

        return "Office";
    }
}